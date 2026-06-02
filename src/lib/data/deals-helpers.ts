/**
 * Pure, client-safe helpers + types for the public deals view.
 *
 * Lives in its own module so client components (MenuExplorer, etc.)
 * can import `bestDealForMenuItem` / `dealBadgeText` without dragging
 * `next/headers` into the browser bundle via deals-public.ts.
 */

export type PublicDeal = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applies_to: "all" | "category" | "item";
  target_slug: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

/** Best deal applicable to a given menu item, if any. */
export function bestDealForMenuItem(
  itemSlug: string,
  categorySlug: string | null | undefined,
  unitPrice: number,
  deals: PublicDeal[],
): { deal: PublicDeal; discountedPrice: number; savingPct: number } | null {
  const applicable = deals.filter((d) => {
    if (d.applies_to === "all") return true;
    if (d.applies_to === "item") return d.target_slug === itemSlug;
    if (d.applies_to === "category")
      return categorySlug != null && d.target_slug === categorySlug;
    return false;
  });
  if (applicable.length === 0) return null;

  let best: { deal: PublicDeal; discountedPrice: number; savingPct: number } | null = null;
  for (const d of applicable) {
    const newPrice =
      d.discount_type === "percentage"
        ? Math.max(0, Math.round(unitPrice * (1 - d.discount_value / 100)))
        : Math.max(0, unitPrice - d.discount_value);
    if (newPrice >= unitPrice) continue;
    const savingPct = Math.round(((unitPrice - newPrice) / unitPrice) * 100);
    if (!best || newPrice < best.discountedPrice) {
      best = { deal: d, discountedPrice: newPrice, savingPct };
    }
  }
  return best;
}

/** Compact human label for a deal: "20% off" or "Rs 100 off". */
export function dealBadgeText(deal: PublicDeal): string {
  if (deal.discount_type === "percentage") return `${deal.discount_value}% off`;
  return `Rs ${deal.discount_value} off`;
}
