"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

// ─── Reservations ──────────────────────────────────────────
export type ReservationRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  party_size: number;
  reserved_for: string;
  ends_at: string | null;
  notes: string | null;
  status:
    | "pending"
    | "confirmed"
    | "seated"
    | "cancelled"
    | "no_show";
  created_at: string;
};

export async function listReservations(filter?: {
  status?: ReservationRow["status"] | "all";
  q?: string;
}): Promise<ReservationRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  let q = supabase
    .from("reservations")
    .select("*")
    .order("reserved_for", { ascending: false })
    .limit(200);

  if (filter?.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter?.q && filter.q.trim()) {
    const term = `%${filter.q.trim()}%`;
    q = q.or(
      `name.ilike.${term},phone.ilike.${term},email.ilike.${term},notes.ilike.${term}`,
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data as ReservationRow[]) ?? [];
}

export async function updateReservationStatus(
  id: string,
  status: ReservationRow["status"],
) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reservations");
}

// ─── Messages ──────────────────────────────────────────────
export type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

export async function listMessages(): Promise<MessageRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as MessageRow[]) ?? [];
}

export async function toggleMessageHandled(id: string, handled: boolean) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ handled })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/messages");
}

// ─── Reviews ───────────────────────────────────────────────
export type ReviewRow = {
  id: string;
  source: string;
  author_name: string;
  rating: number;
  body: string;
  reviewed_at: string | null;
  is_featured: boolean;
  created_at: string;
};

export async function listReviewsAdmin(): Promise<ReviewRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as ReviewRow[]) ?? [];
}

export async function toggleReviewFeatured(id: string, featured: boolean) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_featured: featured })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}

