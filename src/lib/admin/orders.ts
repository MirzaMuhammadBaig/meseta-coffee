"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import type { AdminOrder, OrderStatus } from "@/lib/admin/order-types";

export async function listOrders(filter?: {
  status?: OrderStatus | "all";
  q?: string;
}): Promise<AdminOrder[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  let q = supabase
    .from("orders")
    .select(
      "id, number, customer_name, customer_phone, customer_email, fulfilment, address, items, subtotal_pkr, discount_pkr, total_pkr, payment_method, payment_status, status, notes, coupon_code, safepay_tracker, paid_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter?.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter?.q && filter.q.trim()) {
    const term = `%${filter.q.trim()}%`;
    q = q.or(`number.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term}`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data as AdminOrder[]) ?? [];
}

export async function getOrderByNumber(
  number: string,
): Promise<AdminOrder | null> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name, customer_phone, customer_email, fulfilment, address, items, subtotal_pkr, discount_pkr, total_pkr, payment_method, payment_status, status, notes, coupon_code, safepay_tracker, paid_at, created_at",
    )
    .eq("number", number)
    .maybeSingle();
  return (data as AdminOrder) ?? null;
}

export async function updateOrderStatus(
  number: string,
  next: OrderStatus,
) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: next })
    .eq("number", number);
  if (error) throw error;
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${number}`);
  revalidatePath("/admin");
}
