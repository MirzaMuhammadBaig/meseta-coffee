import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { menu as staticMenu } from "@/lib/data/menu";

/**
 * Single source of truth for pricing a cart.
 *
 * Used by:
 *   • POST /api/cart/preview  — live breakdown while customer types a code
 *   • POST /api/checkout       — final, authoritative pricing on submit
 *
 * NEVER trust client-supplied prices or discounts. This function loads
 * the canonical menu + active deals + the named coupon (if any), applies
 * deal-then-coupon math, and returns the full breakdown.
 *
 * Math order:
 *   1. Each line gets unit_price → discounted_unit_price using the best
 *      applicable deal (multiple deals can't stack on one item).
 *   2. Subtotal = sum(qty × discounted_unit_price).
 *   3. Coupon (if valid) applies to the *post-deal* subtotal.
 *   4. Total = max(0, subtotal − coupon_discount).
 */

export type CartItemInput = { slug: string; qty: number };

export type PricedLine = {
  slug: string;
  name: string;
  qty: number;
  unit_price_pkr: number;
  /** After the best applicable deal (== unit_price_pkr when no deal applies). */
  discounted_unit_price_pkr: number;
  deal_id: string | null;
  deal_title: string | null;
};

export type AppliedCoupon = {
  code: string;
  description: string | null;
  discount_pkr: number;
};

export type PricedCart = {
  lines: PricedLine[];
  /** Sum of qty × unit_price_pkr (before any discounts). */
  raw_subtotal_pkr: number;
  /** Sum of qty × discounted_unit_price_pkr (after deals, before coupon). */
  subtotal_pkr: number;
  /** Total Rs saved by deals across all lines (raw − subtotal). */
  deal_discount_pkr: number;
  /** Rs saved by the coupon (0 if none / invalid). */
  coupon_discount_pkr: number;
  /** Final amount the customer owes (subtotal − coupon, clamped ≥ 0). */
  total_pkr: number;
  /** Coupon details when applied; null otherwise. */
  applied_coupon: AppliedCoupon | null;
  /** Any human-readable problems (cart empty, item dropped, coupon invalid, etc.). */
  notices: string[];
};

type DbDeal = {
  id: string;
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applies_to: "all" | "category" | "item";
  target_slug: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

type DbCoupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_subtotal_pkr: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
};

type DbMenuItem = {
  slug: string;
  name: string;
  price_pkr: number;
  category: { slug: string } | null;
};

/** Pick the deal that gives the biggest absolute discount on a unit price. */
function bestDealFor(
  itemSlug: string,
  categorySlug: string | null,
  unitPrice: number,
  deals: DbDeal[],
): { deal: DbDeal; newPrice: number } | null {
  const applicable = deals.filter((d) => {
    if (d.applies_to === "all") return true;
    if (d.applies_to === "item") return d.target_slug === itemSlug;
    if (d.applies_to === "category")
      return categorySlug != null && d.target_slug === categorySlug;
    return false;
  });
  if (applicable.length === 0) return null;

  let best: { deal: DbDeal; newPrice: number } | null = null;
  for (const d of applicable) {
    const newPrice =
      d.discount_type === "percentage"
        ? Math.max(0, Math.round(unitPrice * (1 - d.discount_value / 100)))
        : Math.max(0, unitPrice - d.discount_value);
    if (newPrice >= unitPrice) continue; // ignore non-discounts
    if (!best || newPrice < best.newPrice) best = { deal: d, newPrice };
  }
  return best;
}

/** Apply a coupon to a subtotal, returning Rs saved (clamped). */
function applyCoupon(coupon: DbCoupon, subtotal: number): number {
  if (coupon.discount_type === "percentage") {
    return Math.round(subtotal * (coupon.discount_value / 100));
  }
  return Math.min(coupon.discount_value, subtotal);
}

export async function priceCart(input: {
  items: CartItemInput[];
  couponCode?: string | null;
}): Promise<PricedCart> {
  const notices: string[] = [];

  // ─── Load canonical menu (with category) ──────────────────
  const supabase = createSupabaseServiceClient();
  let dbItems: DbMenuItem[] = [];
  try {
    const slugs = input.items.map((i) => i.slug);
    if (slugs.length > 0) {
      const { data } = await supabase
        .from("menu_items")
        .select("slug, name, price_pkr, category:menu_categories(slug)")
        .in("slug", slugs)
        .eq("is_disabled", false);
      dbItems = (data as unknown as DbMenuItem[]) ?? [];
    }
  } catch {
    /* fall through to static seed */
  }

  // Fall back to static seed for items not found in DB (dev convenience).
  const itemMap = new Map<
    string,
    { name: string; price_pkr: number; category: string | null }
  >();
  for (const r of dbItems) {
    itemMap.set(r.slug, {
      name: r.name,
      price_pkr: r.price_pkr,
      category: r.category?.slug ?? null,
    });
  }
  for (const seed of staticMenu) {
    if (!itemMap.has(seed.slug)) {
      itemMap.set(seed.slug, {
        name: seed.name,
        price_pkr: seed.price,
        category: seed.category,
      });
    }
  }

  // ─── Load currently-active deals ──────────────────────────
  const nowIso = new Date().toISOString();
  let deals: DbDeal[] = [];
  try {
    const { data } = await supabase
      .from("deals")
      .select(
        "id, title, discount_type, discount_value, applies_to, target_slug, starts_at, ends_at, is_active",
      )
      .eq("is_active", true);
    deals = ((data as DbDeal[]) ?? []).filter((d) => {
      if (d.starts_at && d.starts_at > nowIso) return false;
      if (d.ends_at && d.ends_at < nowIso) return false;
      return true;
    });
  } catch {
    /* no deals available — skip */
  }

  // ─── Build priced lines ───────────────────────────────────
  const lines: PricedLine[] = [];
  let rawSubtotal = 0;
  let subtotal = 0;

  for (const raw of input.items) {
    const item = itemMap.get(raw.slug);
    if (!item) {
      notices.push(`"${raw.slug}" is no longer available and was removed.`);
      continue;
    }
    const qty = Math.min(99, Math.max(1, Math.floor(raw.qty)));
    const best = bestDealFor(raw.slug, item.category, item.price_pkr, deals);

    const line: PricedLine = {
      slug: raw.slug,
      name: item.name,
      qty,
      unit_price_pkr: item.price_pkr,
      discounted_unit_price_pkr: best ? best.newPrice : item.price_pkr,
      deal_id: best ? best.deal.id : null,
      deal_title: best ? best.deal.title : null,
    };
    lines.push(line);
    rawSubtotal += qty * line.unit_price_pkr;
    subtotal += qty * line.discounted_unit_price_pkr;
  }

  const dealDiscount = rawSubtotal - subtotal;

  // ─── Apply coupon (post-deal) ────────────────────────────
  let appliedCoupon: AppliedCoupon | null = null;
  let couponDiscount = 0;

  const code = input.couponCode?.trim().toUpperCase();
  if (code) {
    try {
      const { data: coupon } = await supabase
        .from("coupons")
        .select(
          "id, code, description, discount_type, discount_value, min_subtotal_pkr, max_uses, uses_count, expires_at, is_active",
        )
        .eq("code", code)
        .maybeSingle();

      if (!coupon) {
        notices.push(`Coupon code "${code}" was not found.`);
      } else if (!coupon.is_active) {
        notices.push(`Coupon "${code}" is no longer active.`);
      } else if (coupon.expires_at && coupon.expires_at < nowIso) {
        notices.push(`Coupon "${code}" has expired.`);
      } else if (
        coupon.max_uses != null &&
        coupon.uses_count >= coupon.max_uses
      ) {
        notices.push(`Coupon "${code}" has reached its redemption limit.`);
      } else if (
        coupon.min_subtotal_pkr != null &&
        subtotal < coupon.min_subtotal_pkr
      ) {
        const need = coupon.min_subtotal_pkr - subtotal;
        notices.push(
          `Add Rs ${need.toLocaleString()} more to use coupon "${code}" (minimum Rs ${coupon.min_subtotal_pkr.toLocaleString()}).`,
        );
      } else {
        couponDiscount = applyCoupon(coupon as DbCoupon, subtotal);
        appliedCoupon = {
          code: coupon.code,
          description: coupon.description,
          discount_pkr: couponDiscount,
        };
      }
    } catch {
      notices.push(`Could not validate coupon "${code}" right now.`);
    }
  }

  const total = Math.max(0, subtotal - couponDiscount);

  return {
    lines,
    raw_subtotal_pkr: rawSubtotal,
    subtotal_pkr: subtotal,
    deal_discount_pkr: dealDiscount,
    coupon_discount_pkr: couponDiscount,
    total_pkr: total,
    applied_coupon: appliedCoupon,
    notices,
  };
}

/**
 * Atomically redeem a coupon after a successful order.
 *
 * Uses optimistic concurrency: the UPDATE only matches if `uses_count`
 * hasn't moved between the read and the write. Two simultaneous redemptions
 * race; one wins, one is silently skipped (the discount stays granted —
 * a 1-redemption "leak" past max_uses is acceptable for a café).
 */
export async function redeemCoupon(code: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { data: c } = await supabase
    .from("coupons")
    .select("id, uses_count, max_uses, is_active")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  if (!c || !c.is_active) return;
  if (c.max_uses != null && c.uses_count >= c.max_uses) return;
  await supabase
    .from("coupons")
    .update({ uses_count: c.uses_count + 1 })
    .eq("id", c.id)
    .eq("uses_count", c.uses_count);
}
