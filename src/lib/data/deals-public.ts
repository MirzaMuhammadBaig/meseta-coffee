import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicDeal } from "@/lib/data/deals-helpers";

/**
 * Public, read-only view of currently-running deals.
 * No admin gate. Anon RLS allows reading `is_active = true` rows.
 *
 * Server-only — pulls Supabase via `next/headers`. The pure helpers
 * (`bestDealForMenuItem`, `dealBadgeText`) and the `PublicDeal` type
 * live in `deals-helpers.ts` so client components can use them
 * without dragging server code into the browser bundle.
 */

export type { PublicDeal };

export async function getActiveDeals(): Promise<PublicDeal[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("deals")
      .select(
        "id, title, slug, description, image_url, discount_type, discount_value, applies_to, target_slug, starts_at, ends_at",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const now = new Date().toISOString();
    return ((data as PublicDeal[]) ?? []).filter((d) => {
      if (d.starts_at && d.starts_at > now) return false;
      if (d.ends_at && d.ends_at < now) return false;
      return true;
    });
  } catch {
    return [];
  }
}
