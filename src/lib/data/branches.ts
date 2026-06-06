import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Branch } from "@/lib/data/branches-helpers";

/**
 * Server-only branch fetchers.
 *
 * The `Branch` type + pure helpers (`branchShortAddress`) live in
 * `branches-helpers.ts` so client components can use them without
 * dragging `next/headers` into the browser bundle.
 */
export type { Branch };
export { branchShortAddress } from "@/lib/data/branches-helpers";

/**
 * All active branches, ordered for display. Returns [] (not an error)
 * if the branches table does not exist yet — so the site keeps working
 * on environments where migration 008 has not been applied.
 */
export async function getActiveBranches(): Promise<Branch[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return (data as Branch[]) ?? [];
  } catch {
    return [];
  }
}

/** Single branch by slug. */
export async function getBranchBySlug(slug: string): Promise<Branch | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Branch) ?? null;
  } catch {
    return null;
  }
}

/**
 * The main branch (is_main = true). Falls back to the first sorted
 * branch if no row is flagged. Returns null if branches table is empty
 * or missing.
 */
export async function getMainBranch(): Promise<Branch | null> {
  const all = await getActiveBranches();
  return all.find((b) => b.is_main) ?? all[0] ?? null;
}
