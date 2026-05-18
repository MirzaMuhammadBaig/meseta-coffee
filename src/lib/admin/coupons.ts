"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export type Coupon = {
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
  created_at: string;
};

export async function listCoupons(): Promise<Coupon[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Coupon[]) ?? [];
}

export async function getCoupon(id: string): Promise<Coupon | null> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Coupon) ?? null;
}

function readForm(fd: FormData) {
  const code = String(fd.get("code") ?? "").trim().toUpperCase();
  const expiresAt = String(fd.get("expires_at") ?? "").trim();
  return {
    code,
    description: String(fd.get("description") ?? "").trim() || null,
    discount_type: String(fd.get("discount_type") ?? "percentage") as
      | "percentage"
      | "fixed",
    discount_value:
      Math.max(0, parseInt(String(fd.get("discount_value") ?? "0"), 10) || 0),
    min_subtotal_pkr: fd.get("min_subtotal_pkr")
      ? parseInt(String(fd.get("min_subtotal_pkr")), 10) || 0
      : 0,
    max_uses: fd.get("max_uses")
      ? parseInt(String(fd.get("max_uses")), 10) || null
      : null,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    is_active: fd.get("is_active") === "on",
  };
}

export async function createCoupon(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const payload = readForm(fd);
  if (!payload.code) throw new Error("Code is required.");
  const { error } = await supabase.from("coupons").insert(payload);
  if (error) throw error;
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCoupon(id: string, fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("coupons")
    .update(readForm(fd))
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/coupons");
}
