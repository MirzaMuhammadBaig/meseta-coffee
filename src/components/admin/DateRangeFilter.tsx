"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronDown, RotateCcw } from "lucide-react";
import {
  DATE_PRESETS,
  pktToday,
  presetToRange,
  rangeToPreset,
  type DatePreset,
} from "@/lib/admin/date-range";
import { cn } from "@/lib/utils";

/**
 * Date-range filter shared by /admin/orders and /admin/reservations.
 *
 * Behaviour:
 *   • Preset chips (Today / Yesterday / 7d / 30d / This month / Last month
 *     / All time) — clicking writes `from` & `to` to the URL.
 *   • "Custom…" toggle reveals two date inputs side-by-side; Apply pushes
 *     the chosen range.
 *   • Reset clears `from`, `to`, `status`, `q` in one click.
 *   • All other search params (status, q) are preserved as the admin
 *     bounces between presets.
 *   • PKT-aware throughout — "Today" means today in Pakistan time, not in
 *     the browser's locale.
 */
export default function DateRangeFilter({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from");
  const to = params.get("to");
  const active = rangeToPreset(from, to);

  const [showCustom, setShowCustom] = useState(active === "custom");
  const [pending, startTransition] = useTransition();

  const today = pktToday();
  const [customFrom, setCustomFrom] = useState(from ?? today);
  const [customTo, setCustomTo] = useState(to ?? today);

  const push = useCallback(
    (next: { from?: string | null; to?: string | null }) => {
      const sp = new URLSearchParams(params.toString());
      if (next.from === null || next.from === undefined) sp.delete("from");
      else sp.set("from", next.from);
      if (next.to === null || next.to === undefined) sp.delete("to");
      else sp.set("to", next.to);
      startTransition(() => {
        router.push(`?${sp.toString()}`, { scroll: false });
      });
    },
    [params, router],
  );

  function setPreset(p: DatePreset) {
    const r = presetToRange(p);
    push({ from: r.from, to: r.to });
    setShowCustom(false);
  }

  function applyCustom() {
    if (customFrom && customTo && customFrom > customTo) {
      // Swap so the admin can't accidentally write nothing.
      push({ from: customTo, to: customFrom });
    } else {
      push({ from: customFrom || null, to: customTo || null });
    }
  }

  function resetAll() {
    startTransition(() => {
      // Clear EVERY filter — date, status, and search — in one tap.
      router.push("?", { scroll: false });
    });
    setShowCustom(false);
  }

  const hasAnyFilter =
    params.get("from") ||
    params.get("to") ||
    (params.get("status") && params.get("status") !== "all") ||
    params.get("q");

  return (
    <div
      className={cn(
        "rounded-2xl border border-coffee-100 bg-white p-3 shadow-[0_8px_30px_-22px_rgba(66,41,26,0.2)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 pl-1 pr-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
          <CalendarDays className="h-3.5 w-3.5" /> Range
        </span>

        {DATE_PRESETS.map((p) => {
          const isActive = active === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setPreset(p.value)}
              disabled={pending}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
                isActive
                  ? "bg-coffee-700 text-cream-50"
                  : "border border-coffee-100 bg-white text-coffee-600 hover:border-coffee-300",
              )}
            >
              {p.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
            active === "custom"
              ? "bg-coffee-700 text-cream-50"
              : "border border-coffee-100 bg-white text-coffee-600 hover:border-coffee-300",
          )}
        >
          Custom
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              showCustom && "rotate-180",
            )}
          />
        </button>

        {hasAnyFilter ? (
          <button
            type="button"
            onClick={resetAll}
            disabled={pending}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-coffee-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee-500 transition hover:border-red-200 hover:text-red-700"
          >
            <RotateCcw className="h-3 w-3" />
            Reset filters
          </button>
        ) : null}
      </div>

      {showCustom && (
        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-coffee-100 pt-3">
          <CustomField
            label="From"
            value={customFrom}
            max={today}
            onChange={setCustomFrom}
          />
          <CustomField
            label="To"
            value={customTo}
            max={today}
            onChange={setCustomTo}
          />
          <button
            type="button"
            onClick={applyCustom}
            disabled={pending}
            className="inline-flex items-center rounded-full bg-coffee-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-50 transition hover:bg-coffee-800 disabled:opacity-60"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

function CustomField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: string;
  max?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-500">
        {label}
      </span>
      <input
        type="date"
        value={value}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-coffee-100 bg-white px-3 py-2 text-sm text-coffee-800 focus:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
      />
    </label>
  );
}
