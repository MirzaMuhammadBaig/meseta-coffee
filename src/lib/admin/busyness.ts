"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
  BUSYNESS_LEVELS,
  DEFAULT_AUTO_PROGRESS_MINUTES,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";

/** Server action backing /admin/busyness — saves level + base timings. */
export async function updateBusyness(fd: FormData) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const rawLevel = String(fd.get("busyness_level") ?? "normal");
  const level: BusynessLevel = (
    BUSYNESS_LEVELS as readonly string[]
  ).includes(rawLevel)
    ? (rawLevel as BusynessLevel)
    : "normal";

  const parseMin = (key: keyof typeof DEFAULT_AUTO_PROGRESS_MINUTES) => {
    const n = Number(fd.get(key));
    if (!Number.isFinite(n) || n <= 0) {
      return DEFAULT_AUTO_PROGRESS_MINUTES[key];
    }
    // Clamp to a sane range so a typo can't park an order for years.
    return Math.min(120, Math.max(1, Math.round(n)));
  };

  const minutes = {
    placed_to_accepted: parseMin("placed_to_accepted"),
    accepted_to_preparing: parseMin("accepted_to_preparing"),
    preparing_to_ready: parseMin("preparing_to_ready"),
  };

  const { error } = await supabase
    .from("store_settings")
    .update({
      busyness_level: level,
      auto_progress_minutes: minutes,
    })
    .eq("id", 1);

  if (error) {
    redirect(`/admin/busyness?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/busyness");
  revalidatePath("/admin");
  redirect("/admin/busyness?saved=1");
}
