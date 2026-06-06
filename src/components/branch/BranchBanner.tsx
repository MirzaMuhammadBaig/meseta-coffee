"use client";

import { MapPin, Star } from "lucide-react";
import { useBranch } from "@/lib/branch/BranchProvider";
import { OPEN_EVENT } from "@/components/branch/BranchPicker";

/**
 * Small contextual banner used on /menu and /menu/[slug] so the
 * customer always sees which outlet their order will go to, with a
 * one-tap switch. Renders nothing until BranchProvider is ready and
 * a branch is known — keeps SSR clean.
 *
 * Variant prop:
 *   • "inline" — narrow chip, sits under the page title
 *   • "card"   — full-width card used at the top of /menu
 */
export default function BranchBanner({
  variant = "inline",
}: {
  variant?: "inline" | "card";
}) {
  const { current, ready, branches } = useBranch();
  if (!ready || !current) return null;
  if (branches.length <= 1) return null;

  const openPicker = () =>
    window.dispatchEvent(new Event(OPEN_EVENT));

  if (variant === "card") {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-coffee-100 bg-white px-4 py-3 shadow-[0_8px_30px_-22px_rgba(66,41,26,0.18)] sm:px-5">
        <div className="flex items-center gap-3 text-sm text-coffee-700">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
            <MapPin className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-400">
              Ordering from
            </p>
            <p className="mt-0.5 truncate font-display text-base text-coffee-800 sm:text-lg">
              {current.name.replace(/^Meseta Coffee\s*[—-]\s*/i, "")}
            </p>
          </div>
          {current.google_rating > 0 && (
            <span className="ml-2 hidden items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs text-coffee-600 sm:inline-flex">
              <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
              <span className="font-semibold text-coffee-800">
                {current.google_rating.toFixed(1)}
              </span>
              <span className="text-coffee-400">
                · {current.google_review_count.toLocaleString()}
              </span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={openPicker}
          className="rounded-full border border-coffee-100 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee-700 transition hover:border-coffee-300 hover:text-coffee-900"
        >
          Switch branch
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-coffee-100 bg-white/70 px-3 py-1.5 text-xs text-coffee-600 transition hover:border-coffee-300 hover:text-coffee-900"
    >
      <MapPin className="h-3.5 w-3.5 text-gold-500" />
      <span>
        Ordering from{" "}
        <span className="font-semibold text-coffee-800">
          {current.short_name ?? current.name}
        </span>
      </span>
      <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-700">
        Switch
      </span>
    </button>
  );
}
