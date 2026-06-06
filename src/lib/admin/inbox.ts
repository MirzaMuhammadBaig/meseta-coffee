"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { pktRangeToUtc } from "@/lib/admin/date-range";

// ─── Reservations ──────────────────────────────────────────
export type ReservationRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  party_size: number;
  reserved_for: string;
  ends_at: string | null;
  notes: string | null;
  status:
    | "pending"
    | "confirmed"
    | "seated"
    | "cancelled"
    | "no_show";
  created_at: string;
  /** From migration 008 — null on legacy rows or pre-migration environments. */
  branch_id: string | null;
};

export async function listReservations(filter?: {
  status?: ReservationRow["status"] | "all";
  q?: string;
  /** PKT day strings YYYY-MM-DD (inclusive). Filter on `reserved_for`. */
  from?: string | null;
  to?: string | null;
  /** Branch id to restrict to. "all" or undefined = every branch. */
  branchId?: string | "all" | null;
}): Promise<ReservationRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  let q = supabase
    .from("reservations")
    .select("*")
    .order("reserved_for", { ascending: false })
    .limit(500);

  if (filter?.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter?.q && filter.q.trim()) {
    const term = `%${filter.q.trim()}%`;
    q = q.or(
      `name.ilike.${term},phone.ilike.${term},email.ilike.${term},notes.ilike.${term}`,
    );
  }
  if (filter?.branchId && filter.branchId !== "all") {
    q = q.eq("branch_id", filter.branchId);
  }

  // Filter on `reserved_for` — admin cares about WHEN the reservation is,
  // not when it was booked.
  const { fromIso, toIso } = pktRangeToUtc(filter?.from, filter?.to);
  if (fromIso) q = q.gte("reserved_for", fromIso);
  if (toIso) q = q.lte("reserved_for", toIso);

  let { data, error } = await q;
  if (error && /branch_id/i.test(error.message ?? "")) {
    // Migration 008 not applied — retry without the branch filter.
    const retry = await supabase
      .from("reservations")
      .select("*")
      .order("reserved_for", { ascending: false })
      .limit(500);
    data = retry.data;
    error = retry.error;
  }
  if (error) throw error;
  return (data as ReservationRow[]) ?? [];
}

export async function updateReservationStatus(
  id: string,
  status: ReservationRow["status"],
) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reservations");
}

// ─── Messages ──────────────────────────────────────────────
export type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

export async function listMessages(): Promise<MessageRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as MessageRow[]) ?? [];
}

export async function toggleMessageHandled(id: string, handled: boolean) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ handled })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/messages");
}

// ─── Reviews ───────────────────────────────────────────────
export type ReviewRow = {
  id: string;
  source: string;
  author_name: string;
  rating: number;
  body: string;
  reviewed_at: string | null;
  is_featured: boolean;
  created_at: string;
};

export async function listReviewsAdmin(): Promise<ReviewRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as ReviewRow[]) ?? [];
}

export async function toggleReviewFeatured(id: string, featured: boolean) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_featured: featured })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}

