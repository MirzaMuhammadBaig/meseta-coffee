"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export type Deal = {
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
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function listDeals(): Promise<Deal[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Deal[]) ?? [];
}

export async function getDeal(id: string): Promise<Deal | null> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Deal) ?? null;
}

function readForm(fd: FormData) {
  const title = String(fd.get("title") ?? "").trim();
  const explicitSlug = String(fd.get("slug") ?? "").trim();
  const starts = String(fd.get("starts_at") ?? "").trim();
  const ends = String(fd.get("ends_at") ?? "").trim();
  return {
    title,
    slug: explicitSlug || slugify(title),
    description: String(fd.get("description") ?? "").trim() || null,
    image_url: String(fd.get("image_url") ?? "").trim() || null,
    discount_type: String(fd.get("discount_type") ?? "percentage") as
      | "percentage"
      | "fixed",
    discount_value:
      Math.max(0, parseInt(String(fd.get("discount_value") ?? "0"), 10) || 0),
    applies_to: String(fd.get("applies_to") ?? "all") as "all" | "category" | "item",
    target_slug: String(fd.get("target_slug") ?? "").trim() || null,
    starts_at: starts ? new Date(starts).toISOString() : null,
    ends_at: ends ? new Date(ends).toISOString() : null,
    is_active: fd.get("is_active") === "on",
    sort_order: parseInt(String(fd.get("sort_order") ?? "0"), 10) || 0,
  };
}

export async function createDeal(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const payload = readForm(fd);
  if (!payload.title) throw new Error("Title is required.");
  const { error } = await supabase.from("deals").insert(payload);
  if (error) throw error;
  revalidatePath("/admin/deals");
  redirect("/admin/deals");
}

export async function updateDeal(id: string, fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("deals")
    .update(readForm(fd))
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/deals");
  redirect("/admin/deals");
}

export async function deleteDeal(id: string) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/deals");
}
