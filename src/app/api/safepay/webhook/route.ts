import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifySafepayWebhook } from "@/lib/safepay/client";

export const runtime = "nodejs";

/**
 * Map Safepay event names to our internal payment_status values.
 * Reference: https://docs.getsafepay.com/api/webhooks
 *
 * Safepay sends events like:
 *   - payment_intent.succeeded   -> captured
 *   - payment_intent.failed      -> failed
 *   - payment_intent.cancelled   -> cancelled
 *   - refund.created             -> refunded
 */
const EVENT_TO_STATUS: Record<string, string> = {
  "payment_intent.succeeded": "captured",
  "payment_intent.authorized": "authorized",
  "payment_intent.failed": "failed",
  "payment_intent.cancelled": "cancelled",
  "refund.created": "refunded",
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-sfpy-signature") ?? req.headers.get("X-SFPY-SIGNATURE");

  if (!verifySafepayWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event?: string;
    data?: {
      order_id?: string;
      tracker?: { token?: string };
    };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  const orderNumber = payload?.data?.order_id;
  const tracker = payload?.data?.tracker?.token;

  if (!event) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }
  const newStatus = EVENT_TO_STATUS[event];
  if (!newStatus) {
    // Unknown event — acknowledge so Safepay doesn't retry forever.
    console.warn("[safepay webhook] unhandled event:", event);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createSupabaseServiceClient();
  const update: Record<string, unknown> = { payment_status: newStatus };
  if (newStatus === "captured" || newStatus === "authorized") {
    update.paid_at = new Date().toISOString();
    update.status = "accepted";
  } else if (newStatus === "failed" || newStatus === "cancelled") {
    update.status = "cancelled";
  }

  // Try to find the order by tracker first (most reliable), fall back to order number.
  const query = supabase.from("orders").update(update);
  const { error } = tracker
    ? await query.eq("safepay_tracker", tracker)
    : orderNumber
      ? await query.eq("number", orderNumber)
      : { error: new Error("Missing tracker and order_id") };

  if (error) {
    console.error("[safepay webhook] update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
