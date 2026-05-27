import { NextResponse } from "next/server";
import { priceCart } from "@/lib/pricing";

export const runtime = "nodejs";

/**
 * Public cart-pricing preview.
 *
 * Body: { items: [{slug, qty}], couponCode?: string }
 * Returns the full PricedCart breakdown so the client can show:
 *   • subtotal, deal savings, coupon savings, total
 *   • per-line deal info (for the badge)
 *   • a `notices` array with human-readable issues (coupon invalid, etc.)
 *
 * This is a *preview only* — the authoritative pricing happens server-side
 * again on /api/checkout. Customers can spam this endpoint; cost is one
 * Supabase read per call.
 */
export async function POST(req: Request) {
  let body: { items?: unknown; couponCode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = Array.isArray(body.items)
    ? (body.items as { slug?: unknown; qty?: unknown }[])
        .map((r) => ({
          slug: typeof r?.slug === "string" ? r.slug : "",
          qty: Number(r?.qty),
        }))
        .filter((r) => r.slug && Number.isFinite(r.qty) && r.qty >= 1)
    : [];

  const couponCode =
    typeof body.couponCode === "string" && body.couponCode.trim()
      ? body.couponCode.trim()
      : null;

  const priced = await priceCart({ items, couponCode });
  return NextResponse.json(priced);
}
