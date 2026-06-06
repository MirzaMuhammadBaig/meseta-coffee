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
