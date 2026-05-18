"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export type AdminMenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_pkr: number;
  category_id: string | null;
  image_url: string | null;
  is_bestseller: boolean;
  is_signature: boolean;
  is_disabled: boolean;
  stock: number | null;
  tags: string[];
  sort_order: number;
  category?: { slug: string; name: string } | null;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export async function listMenuItems(): Promise<AdminMenuItem[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, slug, name, description, price_pkr, category_id, image_url, is_bestseller, is_signature, is_disabled, stock, tags, sort_order, category:menu_categories(slug, name)",
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as unknown as AdminMenuItem[]) ?? [];
}

export async function listCategories(): Promise<AdminCategory[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, slug, name, description, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMenuItem(id: string): Promise<AdminMenuItem | null> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("menu_items")
    .select(
      "id, slug, name, description, price_pkr, category_id, image_url, is_bestseller, is_signature, is_disabled, stock, tags, sort_order, category:menu_categories(slug, name)",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as AdminMenuItem) ?? null;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readForm(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const explicitSlug = String(fd.get("slug") ?? "").trim();
  return {
    name,
    slug: explicitSlug || slugify(name),
    description: String(fd.get("description") ?? "").trim() || null,
    price_pkr: Math.max(0, parseInt(String(fd.get("price_pkr") ?? "0"), 10) || 0),
    category_id: String(fd.get("category_id") ?? "") || null,
    image_url: String(fd.get("image_url") ?? "").trim() || null,
    is_bestseller: fd.get("is_bestseller") === "on",
    is_signature: fd.get("is_signature") === "on",
    is_disabled: fd.get("is_disabled") === "on",
    stock: fd.get("stock") ? parseInt(String(fd.get("stock")), 10) : null,
    tags: String(fd.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sort_order: parseInt(String(fd.get("sort_order") ?? "0"), 10) || 0,
  };
}

export async function createMenuItem(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const payload = readForm(fd);
  if (!payload.name) throw new Error("Name is required.");
  if (!payload.slug) throw new Error("Slug could not be derived from name.");

  const { error } = await supabase.from("menu_items").insert(payload);
  if (error) throw error;

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  redirect("/admin/menu");
}

export async function updateMenuItem(id: string, fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const payload = readForm(fd);
  const { error } = await supabase
    .from("menu_items")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath(`/menu/${payload.slug}`);
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function toggleMenuItemDisabled(id: string, next: boolean) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_disabled: next })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function setAllMenuItemsDisabled(disabled: boolean) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_disabled: disabled })
    .not("id", "is", null); // touch every row
  if (error) throw error;
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}
