/**
 * Pure, client-safe Branch type + helpers.
 *
 * Kept separate from `branches.ts` so client components (BranchPicker,
 * BranchProvider, BranchChip) can import without dragging
 * `next/headers` into the browser bundle.
 */

export type Branch = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  google_maps_url: string | null;
  google_embed_url: string | null;
  google_place_id: string | null;
  google_rating: number;
  google_review_count: number;
  sort_order: number;
  is_active: boolean;
  is_main: boolean;
};

/** Compact address string for the nav chip / hero. */
export function branchShortAddress(b: Branch): string {
  return [b.address_line1, b.city].filter(Boolean).join(", ");
}

/**
 * Whether `itemSlug` is available at `branchId`.
 *
 * Phase 1: the menu is shared across all branches so this always
 * returns true. Phase 3 will add a `branch_menu_items` join table and
 * a per-branch availability map can be passed in — at which point the
 * customer will see a "not available at this branch" prompt instead of
 * being able to add to cart.
 *
 * Callers ready for Phase 3 should pass the optional `availability`
 * map (keyed by branch id → set of available item slugs). When the map
 * is omitted we fall back to the Phase 1 default (everything available
 * everywhere) so existing call sites do not need to change.
 */
export function isItemAvailableAtBranch(
  itemSlug: string,
  branchId: string | null,
  availability?: Map<string, Set<string>>,
): boolean {
  if (!branchId) return true;
  if (!availability) return true;
  const set = availability.get(branchId);
  if (!set) return true;
  return set.has(itemSlug);
}
