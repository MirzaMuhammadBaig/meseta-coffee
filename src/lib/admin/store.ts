"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export type StoreSettings = {
  is_open: boolean;
  closed_message: string | null;
  closed_until: string | null;
  show_announcement: boolean;
  announcement_text: string | null;
  hours: { day: string; open: string; close: string }[];
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  accept_card_payments: boolean;
  accept_cash_payments: boolean;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("store_settings")
    .select(
      "is_open, closed_message, closed_until, show_announcement, announcement_text, hours, contact_phone, contact_whatsapp, contact_email, social_instagram, social_facebook, accept_card_payments, accept_cash_payments",
    )
    .eq("id", 1)
    .maybeSingle();

  return (
    (data as StoreSettings) ?? {
      is_open: true,
      closed_message: null,
      closed_until: null,
      show_announcement: false,
      announcement_text: null,
      hours: [],
      contact_phone: null,
      contact_whatsapp: null,
      contact_email: null,
      social_instagram: null,
      social_facebook: null,
      accept_card_payments: true,
      accept_cash_payments: true,
    }
  );
}

export async function setStoreOpen(isOpen: boolean, closedMessage?: string) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const update: Record<string, unknown> = { is_open: isOpen };
  if (typeof closedMessage === "string" && closedMessage.trim()) {
    update.closed_message = closedMessage.trim();
  }
  const { error } = await supabase
    .from("store_settings")
    .update(update)
    .eq("id", 1);
  if (error) throw error;
  revalidatePath("/", "layout");
}

/**
 * Server action used by the dedicated Store status page.
 * Accepts is_open, closed_message, closed_until, show_announcement,
 * announcement_text — and redirects back with a flash flag.
 */
export async function updateStoreStatus(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const isOpen = fd.get("is_open") === "true";
  const closedUntilRaw = String(fd.get("closed_until") ?? "").trim();

  const update = {
    is_open: isOpen,
    closed_message:
      String(fd.get("closed_message") ?? "").trim() || null,
    closed_until: closedUntilRaw ? new Date(closedUntilRaw).toISOString() : null,
    show_announcement: fd.get("show_announcement") === "on",
    announcement_text:
      String(fd.get("announcement_text") ?? "").trim() || null,
  };

  const { error } = await supabase
    .from("store_settings")
    .update(update)
    .eq("id", 1);

  if (error) {
    redirect(
      `/admin/store-status?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/store-status");
  redirect("/admin/store-status?saved=1");
}

export async function updateStoreSettings(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const hours = days.map((day) => ({
    day,
    open: String(fd.get(`open_${day}`) ?? ""),
    close: String(fd.get(`close_${day}`) ?? ""),
  }));

  const update = {
    closed_message:
      String(fd.get("closed_message") ?? "").trim() || null,
    show_announcement: fd.get("show_announcement") === "on",
    announcement_text:
      String(fd.get("announcement_text") ?? "").trim() || null,
    hours,
    contact_phone:
      String(fd.get("contact_phone") ?? "").trim() || null,
    contact_whatsapp:
      String(fd.get("contact_whatsapp") ?? "").trim() || null,
    contact_email:
      String(fd.get("contact_email") ?? "").trim() || null,
    social_instagram:
      String(fd.get("social_instagram") ?? "").trim() || null,
    social_facebook:
      String(fd.get("social_facebook") ?? "").trim() || null,
    accept_card_payments: fd.get("accept_card_payments") === "on",
    accept_cash_payments: fd.get("accept_cash_payments") === "on",
  };

  const { error } = await supabase
    .from("store_settings")
    .update(update)
    .eq("id", 1);
  if (error) {
    redirect(
      `/admin/settings?error=${encodeURIComponent(error.message)}`,
    );
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
