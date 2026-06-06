import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import {
  initSafepaySession,
  isSafepayConfigured,
} from "@/lib/safepay/client";
import { getStoreSettings } from "@/lib/admin/store";
import { getNextOpening, isWithinHours } from "@/lib/hours";
import { site } from "@/lib/data/site";
import { nextAutoAdvanceAt } from "@/lib/admin/busyness-types";
import { priceCart, redeemCoupon } from "@/lib/pricing";

export const runtime = "nodejs";

type Payload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  notes?: unknown;
  fulfilment?: unknown;
  address?: unknown;
  payment_method?: unknown;
  items?: unknown;
  coupon_code?: unknown;
  branch_id?: unknown;
};

type IncomingItem = { slug?: unknown; qty?: unknown };

function generateOrderNumber() {
  // 6-char human-friendly code, e.g. MES-9F2HQ7
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip ambiguous chars
  let id = "";
  for (let i = 0; i < 6; i++) id += alpha[Math.floor(Math.random() * alpha.length)];
  return `MES-${id}`;
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ─── Validate basics ────────────────────────────────────
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" && body.email.trim()
    ? body.email.trim()
    : null;
  const notes = typeof body.notes === "string" && body.notes.trim()
    ? body.notes.trim()
    : null;
  const fulfilment = body.fulfilment === "delivery" ? "delivery" : "pickup";
  const address = fulfilment === "delivery" && typeof body.address === "string"
    ? body.address.trim()
    : null;
  const paymentMethod = body.payment_method;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Name and phone are required." },
      { status: 400 },
    );
  }
  if (paymentMethod !== "card" && paymentMethod !== "cash") {
    return NextResponse.json(
      { error: "Unsupported payment method." },
      { status: 400 },
    );
  }
  if (fulfilment === "delivery" && !address) {
    return NextResponse.json(
      { error: "Address is required for delivery orders." },
      { status: 400 },
    );
  }

  // ─── Refuse orders when the store is closed ─────────────
  // Two ways to be closed: the admin's manual switch, or simply being
  // outside the published opening hours. Both block the order.
  const settings = await getStoreSettings().catch(() => null);
  const hours =
    settings?.hours && settings.hours.length > 0
      ? settings.hours
      : site.hours;
  if (settings && !settings.is_open) {
    return NextResponse.json(
      {
        error:
          settings.closed_message ?? "The store is closed for online orders right now.",
        code: "store_closed",
      },
      { status: 503 },
    );
  }
  if (!isWithinHours(hours)) {
    const next = getNextOpening(hours);
    return NextResponse.json(
      {
        error: next
          ? `We are closed right now — we reopen ${next.dayLabel} at ${next.time}.`
          : "We are closed right now. Please order during our opening hours.",
        code: "store_closed",
      },
      { status: 503 },
    );
  }
  if (settings && paymentMethod === "card" && !settings.accept_card_payments) {
    return NextResponse.json(
      { error: "Card payments are temporarily disabled." },
      { status: 400 },
    );
  }
  if (settings && paymentMethod === "cash" && !settings.accept_cash_payments) {
    return NextResponse.json(
      { error: "Cash payments are temporarily disabled." },
      { status: 400 },
    );
  }

  // ─── Re-price the cart server-side ──────────────────────
  // The pricing engine is the single source of truth. It re-loads the
  // canonical menu (so client-supplied prices are ignored), applies any
  // active deals automatically, and validates the coupon if one was sent.
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  const incoming = (body.items as IncomingItem[])
    .map((r) => ({
      slug: typeof r?.slug === "string" ? r.slug : "",
      qty: Number(r?.qty),
    }))
    .filter((r) => r.slug && Number.isFinite(r.qty) && r.qty >= 1);

  const couponCodeRaw =
    typeof body.coupon_code === "string" && body.coupon_code.trim()
      ? body.coupon_code.trim().toUpperCase()
      : null;

  const priced = await priceCart({ items: incoming, couponCode: couponCodeRaw });
  if (priced.lines.length === 0) {
    return NextResponse.json(
      {
        error:
          "None of the items in your cart are available right now. Refresh and try again.",
      },
      { status: 400 },
    );
  }

  // If the client thinks a coupon applies but the engine rejected it
  // (expired, exhausted, min not met) — bail with the first notice so the
  // customer sees the real reason instead of a silently-dropped discount.
  if (couponCodeRaw && !priced.applied_coupon) {
    const reason = priced.notices.find((n) => n.includes(couponCodeRaw)) ?? priced.notices[0];
    return NextResponse.json(
      {
        error: reason ?? `Coupon "${couponCodeRaw}" could not be applied.`,
        code: "coupon_invalid",
      },
      { status: 400 },
    );
  }

  // Shape the items column to match what the admin order detail expects.
  // Keep deal_id + deal_title per line so admin analytics can answer
  // "which deal generated this order line?" without joining anywhere.
  const lines = priced.lines.map((l) => ({
    slug: l.slug,
    name: l.name,
    qty: l.qty,
    price_pkr: l.discounted_unit_price_pkr,
    original_price_pkr: l.unit_price_pkr,
    deal_id: l.deal_id,
    deal_title: l.deal_title,
  }));
  const subtotal = priced.subtotal_pkr;
  const totalDiscount =
    priced.deal_discount_pkr + priced.coupon_discount_pkr;

  // ─── Persist the order ──────────────────────────────────
  const supabase = createSupabaseServiceClient();
  const orderNumber = generateOrderNumber();

  // Start the auto-progression timer for the freshly-placed order so it
  // walks through accepted/preparing/ready on its own, paced by the
  // admin's current busyness level.
  const autoAdvanceAt = nextAutoAdvanceAt(
    "placed",
    settings?.busyness_level ?? "normal",
    settings?.auto_progress_minutes ?? {
      placed_to_accepted: 2,
      accepted_to_preparing: 5,
      preparing_to_ready: 5,
    },
  );

  // Resolve the branch this order belongs to. The client sends the
  // chosen branch_id from the BranchProvider. If it is missing or does
  // not map to an active branch, fall back to the main branch so a
  // legacy client can never produce an orphaned order.
  const claimedBranchId =
    typeof body.branch_id === "string" && body.branch_id.trim()
      ? body.branch_id.trim()
      : null;
  let branchId: string | null = null;
  try {
    const branchQuery = supabase
      .from("branches")
      .select("id")
      .eq("is_active", true);
    const { data: branchRows } = claimedBranchId
      ? await branchQuery.eq("id", claimedBranchId).maybeSingle()
          .then((r) => ({ data: r.data ? [r.data] : [] }))
      : await branchQuery.eq("is_main", true).limit(1);
    branchId = (branchRows?.[0] as { id: string } | undefined)?.id ?? null;
    if (!branchId) {
      // Claimed branch not active — silently fall through to main.
      const { data: mainRows } = await supabase
        .from("branches")
        .select("id")
        .eq("is_active", true)
        .eq("is_main", true)
        .limit(1);
      branchId = (mainRows?.[0] as { id: string } | undefined)?.id ?? null;
    }
  } catch {
    // branches table not migrated yet — leave branch_id null and let the
    // defensive insert retry handle it below.
    branchId = null;
  }

  const baseRow: Record<string, unknown> = {
    number: orderNumber,
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    fulfilment,
    address,
    items: lines,
    subtotal_pkr: subtotal,
    discount_pkr: totalDiscount,
    total_pkr: priced.total_pkr,
    coupon_code: priced.applied_coupon?.code ?? null,
    payment_method: paymentMethod,
    notes,
  };
  if (branchId) baseRow.branch_id = branchId;

  let { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({ ...baseRow, auto_advance_at: autoAdvanceAt })
    .select("id, number")
    .single();

  // Migration 007 not applied yet? Retry without the new column so the
  // order still places — just no auto-progression.
  if (
    insertError &&
    /auto_advance_at/i.test(insertError.message ?? "")
  ) {
    console.warn(
      "[checkout] auto_advance_at column missing — retrying without it (apply migration 007).",
    );
    const retry = await supabase
      .from("orders")
      .insert(baseRow)
      .select("id, number")
      .single();
    order = retry.data;
    insertError = retry.error;
  }

  // Migration 008 not applied yet? Drop branch_id and retry so the order
  // still places on environments where the column does not exist yet.
  if (insertError && /branch_id/i.test(insertError.message ?? "")) {
    console.warn(
      "[checkout] branch_id column missing — retrying without it (apply migration 008).",
    );
    const { branch_id: _omit, ...withoutBranch } = baseRow;
    const retry = await supabase
      .from("orders")
      .insert(withoutBranch)
      .select("id, number")
      .single();
    order = retry.data;
    insertError = retry.error;
  }

  if (insertError || !order) {
    console.error("[checkout] order insert failed", insertError);
    return NextResponse.json(
      { error: "Could not save your order. Please try again." },
      { status: 500 },
    );
  }

  // ─── Redeem the coupon (best-effort, atomic-ish) ────────
  // If the order persisted with a coupon, increment uses_count now.
  // Optimistic concurrency inside redeemCoupon prevents two simultaneous
  // orders from double-counting the same redemption slot.
  if (priced.applied_coupon) {
    await redeemCoupon(priced.applied_coupon.code).catch((err) => {
      console.warn("[checkout] coupon redemption failed (non-fatal):", err);
    });
  }

  // ─── Card via Safepay ───────────────────────────────────
  if (paymentMethod === "card") {
    if (!isSafepayConfigured()) {
      // Safepay env vars aren't set yet — surface a clear error so the
      // client can prompt the guest to switch to cash on pickup.
      return NextResponse.json(
        {
          error:
            "Card payments are not configured yet. Please choose cash on pickup.",
          code: "safepay_not_configured",
        },
        { status: 503 },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    try {
      const { tracker, checkoutUrl } = await initSafepaySession({
        orderId: order.number,
        amountPkr: priced.total_pkr,
        customer: { name, phone, email: email ?? undefined },
        successUrl: `${siteUrl}/checkout/success?order=${order.number}&fulfilment=${fulfilment}&payment=card`,
        cancelUrl: `${siteUrl}/checkout/cancel?order=${order.number}`,
      });

      // Store Safepay tracker so the webhook can find this order later.
      await supabase
        .from("orders")
        .update({ safepay_tracker: tracker })
        .eq("id", order.id);

      return NextResponse.json({
        ok: true,
        order_number: order.number,
        payment_method: "card",
        checkout_url: checkoutUrl,
      });
    } catch (err) {
      console.error("[checkout] Safepay init failed", err);
      return NextResponse.json(
        {
          error:
            "Could not reach Safepay right now. Please try again in a moment.",
        },
        { status: 502 },
      );
    }
  }

  // ─── Cash on pickup ─────────────────────────────────────
  return NextResponse.json({
    ok: true,
    order_number: order.number,
    payment_method: paymentMethod,
  });
}
