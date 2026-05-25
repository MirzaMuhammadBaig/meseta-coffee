"use client";

import { useState } from "react";
import { AlertTriangle, Power, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  initialIsOpen: boolean;
  initialClosedMessage: string | null;
  onSave: (fd: FormData) => void | Promise<void>;
};

export default function StoreStatusForm({
  initialIsOpen,
  initialClosedMessage,
  onSave,
}: Props) {
  // Local state so the preview pane updates as the admin types.
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [reason, setReason] = useState(initialClosedMessage ?? "");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
      {/* ─── Form card ─────────────────────────────────────── */}
      <form
        action={onSave}
        className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7"
      >
        {/* Hidden field so server reads the toggled value */}
        <input type="hidden" name="is_open" value={isOpen ? "true" : "false"} />

        {/* Status pill */}
        <div
          className={cn(
            "flex flex-col items-start gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
            isOpen
              ? "border-matcha-500/30 bg-matcha-500/10"
              : "border-red-200 bg-red-50",
          )}
        >
          <div className="flex items-center gap-3.5">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cream-50 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]",
                isOpen ? "bg-matcha-600" : "bg-red-600",
              )}
            >
              <Power className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-display text-lg text-coffee-800">
                {isOpen ? "Store is currently open" : "Store is currently closed"}
              </p>
              <p className="text-xs text-coffee-500">
                {isOpen
                  ? "Customers can place orders normally."
                  : "Customers see the closed banner and cannot place orders."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
              isOpen
                ? "bg-red-600 hover:bg-red-700"
                : "bg-matcha-600 hover:bg-matcha-500",
            )}
          >
            <Power className="h-3.5 w-3.5" />
            {isOpen ? "Close store" : "Open store"}
          </button>
        </div>

        {/* Reason */}
        <div className="mt-7">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Reason (shown on banner)
          </label>
          <input
            name="closed_message"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g. We are restocking ingredients."
            maxLength={200}
            className="input mt-2"
          />
        </div>

        {/* Save */}
        <div className="mt-7 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-coffee-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition hover:bg-coffee-900"
          >
            <Save className="h-3.5 w-3.5" /> Save settings
          </button>
        </div>
      </form>

      {/* ─── Preview card ─────────────────────────────────── */}
      <aside className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7">
        <h2 className="font-display text-xl text-coffee-800">
          What customers will see
        </h2>
        <p className="mt-1 text-sm text-coffee-500">
          Preview of the banner shown at the top of every page on the public
          site.
        </p>

        {/* Closed banner preview */}
        {!isOpen && (
          <div className="mt-5 rounded-2xl bg-coffee-900 px-5 py-4 text-cream-50 shadow-inner">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <div>
                <p className="font-semibold">We are temporarily closed.</p>
                <p className="mt-0.5 text-sm text-cream-100/85">
                  {reason || "We will be back soon."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty-state when the store is open */}
        {isOpen && (
          <div className="mt-5 rounded-2xl border border-dashed border-coffee-200 p-6 text-center">
            <p className="text-sm text-coffee-500">
              No closed banner is shown — the store is open.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
