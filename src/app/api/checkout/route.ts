import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import {
  initSafepaySession,
  isSafepayConfigured,
} from "@/lib/safepay/client";
import { menu } from "@/lib/data/menu";
import { getStoreSettings } from "@/lib/admin/store";
import { getNextOpening, isWithinHours } from "@/lib/hours";
import { site } from "@/lib/data/site";
import { nextAutoAdvanceAt } from "@/lib/admin/busyness-types";

export const runtime = "nodejs";

/**
 * Look every cart slug up in the live catalog (Supabase, excluding disabled
 * items). Falls back to the static seed when Supabase is empty so dev still
 * works. Returns canonical name + price so the client cannot tamper.
 */
async function priceCart(items: { slug: string; qty: number }[]) {
  const valid: { slug: string; name: string; qty: number; price_pkr: number }[] = [];
  try {
    const supabase = createSupabaseServerClient();
    const slugs = items.map((i) => i.slug);
    const { data } = await supabase
      .from("menu_items")
      .select("slug, name, price_pkr")
      .in("slug", slugs)
      .eq("is_disabled", false);
    if (data && data.length > 0) {
      for (const raw of items) {
        const row = data.find((r) => r.slug === raw.slug);
        if (!row) continue;
        valid.push({
          slug: row.slug,
          name: row.name,
          qty: Math.min(Math.max(Math.floor(raw.qty), 1), 99),
          price_pkr: row.price_pkr,
        });
      }
      return valid;
    }
  } catch {
    // fall through to static
  }
  for (const raw of items) {
    const item = menu.find((m) => m.slug === raw.slug);
    if (!item) continue;
    valid.push({
      slug: item.slug,
      name: item.name,
      qty: Math.min(Math.max(Math.floor(raw.qty), 1), 99),
      price_pkr: item.price,
    });
  }
  return valid;
}

type Payload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  notes?: unknown;
  fulfilment?: unknown;
  address?: unknown;
  payment_method?: unknown;
  items?: unknown;
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
  // Never trust client-supplied prices: look every item up in the live
  // catalog (excluding disabled items) and ignore unknown slugs.
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  const incoming = (body.items as IncomingItem[])
    .map((r) => ({
      slug: typeof r?.slug === "string" ? r.slug : "",
      qty: Number(r?.qty),
    }))
    .filter((r) => r.slug && Number.isFinite(r.qty) && r.qty >= 1);

  const lines = await priceCart(incoming);
  if (lines.length === 0) {
    return NextResponse.json(
      {
        error:
          "None of the items in your cart are available right now. Refresh and try again.",
      },
      { status: 400 },
    );
  }
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price_pkr, 0);

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

  const baseRow = {
    number: orderNumber,
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    fulfilment,
    address,
    items: lines,
    subtotal_pkr: subtotal,
    total_pkr: subtotal,
    payment_method: paymentMethod,
    notes,
  };

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

  if (insertError || !order) {
    console.error("[checkout] order insert failed", insertError);
    return NextResponse.json(
      { error: "Could not save your order. Please try again." },
      { status: 500 },
    );
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
        amountPkr: subtotal,
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
