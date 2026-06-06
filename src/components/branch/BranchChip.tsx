"use client";

import { MapPin, ChevronDown } from "lucide-react";
import { useBranch } from "@/lib/branch/BranchProvider";
import { OPEN_EVENT } from "@/components/branch/BranchPicker";

/**
 * Compact "you are ordering from X" chip for the navbar. Clicking it
 * dispatches the open-picker event so the customer can switch.
 * Returns null until the BranchProvider is ready and a current branch
 * is known — keeps SSR + first paint clean.
 */
export default function BranchChip() {
  const { current, ready, branches } = useBranch();

  if (!ready || !current) return null;
  // No point showing the chip if there is only one branch — no choice to make.
  if (branches.length <= 1) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="inline-flex items-center gap-1.5 rounded-full border border-coffee-100 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-coffee-700 backdrop-blur transition hover:border-coffee-300 hover:text-coffee-900"
      aria-label={`Currently ordering from ${current.name}. Tap to switch branches.`}
    >
      <MapPin className="h-3 w-3 text-gold-500" />
      <span className="max-w-[120px] truncate normal-case tracking-normal text-coffee-700">
        {current.short_name ?? current.name}
      </span>
      <ChevronDown className="h-3 w-3 text-coffee-400" />
    </button>
  );
}
