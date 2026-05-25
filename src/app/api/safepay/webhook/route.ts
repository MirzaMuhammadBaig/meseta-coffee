import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifySafepayWebhook } from "@/lib/safepay/client";
import {
  DEFAULT_AUTO_PROGRESS_MINUTES,
  nextAutoAdvanceAt,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";

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
    // Reset the auto-advance timer to the next stage (preparing) so a
    // paid order keeps moving on its own at the current busyness pace.
    const { data: settings } = await supabase
      .from("store_settings")
      .select("busyness_level, auto_progress_minutes")
      .eq("id", 1)
      .maybeSingle();
    update.auto_advance_at = nextAutoAdvanceAt(
      "accepted",
      (settings?.busyness_level as BusynessLevel) ?? "normal",
      {
        ...DEFAULT_AUTO_PROGRESS_MINUTES,
        ...((settings?.auto_progress_minutes as Partial<AutoProgressMinutes>) ??
          {}),
      },
    );
  } else if (newStatus === "failed" || newStatus === "cancelled") {
    update.status = "cancelled";
    update.auto_advance_at = null;
  }

  // Try to find the order by tracker first (most reliable), fall back to order number.
  async function runUpdate(payload: Record<string, unknown>) {
    const q = supabase.from("orders").update(payload);
    return tracker
      ? q.eq("safepay_tracker", tracker)
      : orderNumber
        ? q.eq("number", orderNumber)
        : Promise.resolve({
            error: new Error("Missing tracker and order_id"),
          });
  }

  let { error } = await runUpdate(update);

  // Migration 007 not applied yet? Retry without the auto_advance_at field.
  if (error && /auto_advance_at/i.test(error.message ?? "")) {
    console.warn(
      "[safepay webhook] auto_advance_at column missing — retrying without it.",
    );
    const { auto_advance_at: _drop, ...rest } = update;
    ({ error } = await runUpdate(rest));
  }

  if (error) {
    console.error("[safepay webhook] update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
