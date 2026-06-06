"use server";

import { revalidatePath } from "next/cache";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import type { AdminOrder, OrderStatus } from "@/lib/admin/order-types";
import {
  DEFAULT_AUTO_PROGRESS_MINUTES,
  nextAutoAdvanceAt,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";
import { pktRangeToUtc } from "@/lib/admin/date-range";

// Columns we always want to read for an admin order view.
const ORDER_COLUMNS =
  "id, number, customer_name, customer_phone, customer_email, fulfilment, address, items, subtotal_pkr, discount_pkr, total_pkr, payment_method, payment_status, status, notes, coupon_code, safepay_tracker, paid_at, created_at, auto_advance_at";

/**
 * Walk every order forward through its auto-advance chain
 * (placed → accepted → preparing → ready) when its timer has elapsed.
 *
 * Lazily called by `listOrders` / `getOrderByNumber`, so reading the
 * admin dashboard keeps orders in sync without needing a cron job.
 *
 * Idempotent: each update is conditioned on the order still being in
 * its expected status, so concurrent ticks won't double-advance.
 */
async function tickAutoAdvance(): Promise<void> {
  // Wrapped so the whole function is a no-op if migration 007 hasn't
  // been applied yet (missing `auto_advance_at` column would throw and
  // break every admin page).
  try {
    const supabase = createSupabaseServiceClient();

    // Pull the current busyness + base timings.
    const { data: settings } = await supabase
      .from("store_settings")
      .select("busyness_level, auto_progress_minutes")
      .eq("id", 1)
      .maybeSingle();

    const level = (settings?.busyness_level as BusynessLevel) ?? "normal";
    const base: AutoProgressMinutes = {
      ...DEFAULT_AUTO_PROGRESS_MINUTES,
      ...((settings?.auto_progress_minutes as Partial<AutoProgressMinutes>) ??
        {}),
    };

    const { data: due, error: dueErr } = await supabase
      .from("orders")
      .select("id, status")
      .not("auto_advance_at", "is", null)
      .lte("auto_advance_at", new Date().toISOString())
      .in("status", ["placed", "accepted", "preparing"]);

    if (dueErr) {
      // Most likely the auto_advance_at column doesn't exist yet.
      console.warn("[orders] tickAutoAdvance skipped:", dueErr.message);
      return;
    }
    if (!due || due.length === 0) return;

    for (const o of due) {
      const nextStatus =
        o.status === "placed"
          ? "accepted"
          : o.status === "accepted"
            ? "preparing"
            : o.status === "preparing"
              ? "ready"
              : null;
      if (!nextStatus) continue;

      const newAdvanceAt = nextAutoAdvanceAt(nextStatus, level, base);

      await supabase
        .from("orders")
        .update({ status: nextStatus, auto_advance_at: newAdvanceAt })
        .eq("id", o.id)
        // Only update if the order still has the status we expect — so a
        // concurrent admin click can't be silently overwritten.
        .eq("status", o.status);
    }
  } catch (err) {
    console.warn("[orders] tickAutoAdvance failed (safe to ignore):", err);
  }
}

export async function listOrders(filter?: {
  status?: OrderStatus | "all";
  q?: string;
  /** PKT day strings YYYY-MM-DD (inclusive). Filter on `created_at`. */
  from?: string | null;
  to?: string | null;
  /** Branch id to restrict to. "all" or undefined = every branch. */
  branchId?: string | "all" | null;
}): Promise<AdminOrder[]> {
  await requireAdmin();
  await tickAutoAdvance();

  const supabase = createSupabaseServerClient();
  // Pull `branch_id` alongside the rest so the admin UI can show it.
  // We use a column list that the existing migration may or may not have
  // (008 adds branch_id); a missing column would throw, so we fall back
  // to the legacy column set on error.
  const COLUMNS_WITH_BRANCH = `${ORDER_COLUMNS}, branch_id`;
  let q = supabase
    .from("orders")
    .select(COLUMNS_WITH_BRANCH)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filter?.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter?.q && filter.q.trim()) {
    const term = `%${filter.q.trim()}%`;
    q = q.or(
      `number.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term}`,
    );
  }
  if (filter?.branchId && filter.branchId !== "all") {
    q = q.eq("branch_id", filter.branchId);
  }

  const { fromIso, toIso } = pktRangeToUtc(filter?.from, filter?.to);
  if (fromIso) q = q.gte("created_at", fromIso);
  if (toIso) q = q.lte("created_at", toIso);

  let { data, error } = (await q) as {
    data: AdminOrder[] | null;
    error: { message?: string } | null;
  };
  // Migration 008 not applied yet? Re-query without branch_id.
  if (error && /branch_id/i.test(error.message ?? "")) {
    const retry = (await supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500)) as {
      data: AdminOrder[] | null;
      error: { message?: string } | null;
    };
    data = retry.data;
    error = retry.error;
  }
  if (error) throw error;
  return data ?? [];
}

export async function getOrderByNumber(
  number: string,
): Promise<AdminOrder | null> {
  await requireAdmin();
  await tickAutoAdvance();

  const supabase = createSupabaseServerClient();
  // Try with branch_id (migration 008+) and fall back to legacy column set
  // so the page keeps rendering on environments where 008 has not run yet.
  let { data } = (await supabase
    .from("orders")
    .select(`${ORDER_COLUMNS}, branch_id`)
    .eq("number", number)
    .maybeSingle()) as { data: AdminOrder | null };
  if (!data) {
    const retry = (await supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .eq("number", number)
      .maybeSingle()) as { data: Omit<AdminOrder, "branch_id"> | null };
    data = retry.data ? { ...retry.data, branch_id: null } : null;
  }
  return data ?? null;
}

/**
 * Manual admin status transition. Also sets the next auto-advance
 * timer for the destination state (or clears it for terminal states).
 */
export async function updateOrderStatus(
  number: string,
  next: OrderStatus,
) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  // Read current busyness so the new timer respects whichever level
  // the admin set right now.
  const { data: settings } = await supabase
    .from("store_settings")
    .select("busyness_level, auto_progress_minutes")
    .eq("id", 1)
    .maybeSingle();

  const level = (settings?.busyness_level as BusynessLevel) ?? "normal";
  const base: AutoProgressMinutes = {
    ...DEFAULT_AUTO_PROGRESS_MINUTES,
    ...((settings?.auto_progress_minutes as Partial<AutoProgressMinutes>) ??
      {}),
  };

  let { error } = await supabase
    .from("orders")
    .update({
      status: next,
      auto_advance_at: nextAutoAdvanceAt(next, level, base),
    })
    .eq("number", number);

  // Migration 007 not applied yet? Retry without the new column so the
  // status change still goes through — just no auto-progression timer.
  if (error && /auto_advance_at/i.test(error.message ?? "")) {
    console.warn(
      "[orders] auto_advance_at column missing — updating status only.",
    );
    ({ error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("number", number));
  }

  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${number}`);
  revalidatePath("/admin");
}
