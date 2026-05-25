"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  DEFAULT_AUTO_PROGRESS_MINUTES,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";

export type StoreSettings = {
  is_open: boolean;
  closed_message: string | null;
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
  busyness_level: BusynessLevel;
  auto_progress_minutes: AutoProgressMinutes;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = createSupabaseServerClient();
  // `select("*")` (not an explicit column list) so a single missing /
  // not-yet-migrated column can never break the whole settings read.
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  // Merge whatever came back with safe defaults — so a brand-new install
  // (or a row that hasn't been migrated yet) still has sensible values.
  const fallback: StoreSettings = {
    is_open: true,
    closed_message: null,
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
    busyness_level: "normal",
    auto_progress_minutes: DEFAULT_AUTO_PROGRESS_MINUTES,
  };
  if (!data) return fallback;
  return {
    ...fallback,
    ...(data as Partial<StoreSettings>),
    // Coerce the jsonb-stored object back to our typed shape with safe defaults.
    auto_progress_minutes: {
      ...DEFAULT_AUTO_PROGRESS_MINUTES,
      ...((data as { auto_progress_minutes?: Partial<AutoProgressMinutes> })
        .auto_progress_minutes ?? {}),
    },
  };
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
 * Server action for the dedicated Store status page — open/closed
 * toggle + the closed-store reason. (The announcement banner has its
 * own page + action, `updateAnnouncement`.)
 */
export async function updateStoreStatus(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const update = {
    is_open: fd.get("is_open") === "true",
    closed_message:
      String(fd.get("closed_message") ?? "").trim() || null,
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

/**
 * Server action for the dedicated Announcement page. The site-wide
 * banner shows whenever there is text — `show_announcement` is kept in
 * sync with that so the boolean column always reflects reality.
 */
export async function updateAnnouncement(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const announcementText =
    String(fd.get("announcement_text") ?? "").trim() || null;

  const { error } = await supabase
    .from("store_settings")
    .update({
      announcement_text: announcementText,
      show_announcement: announcementText !== null,
    })
    .eq("id", 1);

  if (error) {
    redirect(
      `/admin/announcement?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/announcement");
  redirect("/admin/announcement?saved=1");
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
