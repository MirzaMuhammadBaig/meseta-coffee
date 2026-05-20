"use client";

import { useEffect, useState } from "react";
import {
  nextWhenPhrase,
  useLiveStoreStatus,
} from "@/lib/store-status/useLiveStoreStatus";
import { cn } from "@/lib/utils";

/**
 * Hero store-status badge.
 *
 *   • OPEN  — green pill: "Open now · {rotating top item}"
 *   • CLOSED — red pill: "Closed · Opens {when}" (or the admin's custom
 *     close message when the shop was manually shut)
 *
 * Both states sit on a soft breathing glow halo (green when open, red
 * when closed). Re-evaluates itself via `useLiveStoreStatus`, so it
 * flips on its own the moment the shop crosses an opening/closing time.
 */

const SERVING = [
  "Turkish Matcha",
  "Meseta Layered Latte",
  "Spanish Latte",
  "Walnut Fudge Brownie",
  "Classic Cold Brew",
];

export default function StoreStatusBadge() {
  const status = useLiveStoreStatus();
  const open = status.open;

  // Rotate the "now serving" item — only while the shop is open.
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % SERVING.length);
        setVisible(true);
      }, 250);
    }, 3000);
    return () => clearInterval(t);
  }, [open]);

  const closedLabel =
    status.reason === "manually_closed" && status.closedMessage?.trim()
      ? status.closedMessage
      : `Opens ${nextWhenPhrase(status)}`;

  return (
    <div className="relative inline-flex max-w-full">
      {/* Breathing glow halo */}
      <span
        aria-hidden
        className={cn(
          "absolute -inset-2 rounded-full blur-lg animate-badge-glow motion-reduce:animate-none",
          open ? "bg-matcha-400/35" : "bg-red-500/35",
        )}
      />

      <div
        className={cn(
          "relative inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur sm:gap-2.5 sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em]",
          open
            ? "border-matcha-400/30 bg-coffee-900/50 text-cream-50"
            : "border-red-400/30 bg-red-950/55 text-red-50",
        )}
      >
        {/* Pulsing live dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-80",
              open ? "bg-matcha-400" : "bg-red-400",
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              open ? "bg-matcha-500" : "bg-red-500",
            )}
          />
        </span>

        {open ? (
          <>
            <span className="shrink-0 text-matcha-300">Open now</span>
            <span aria-hidden className="shrink-0 text-cream-100/25">
              ·
            </span>
            <span
              className={cn(
                "min-w-0 max-w-[130px] truncate font-medium tracking-normal text-cream-50 transition-all duration-300 ease-out sm:max-w-[180px]",
                visible
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-1 opacity-0",
              )}
            >
              {SERVING[idx]}
            </span>
          </>
        ) : (
          <>
            <span className="shrink-0 text-red-300">Closed</span>
            <span aria-hidden className="shrink-0 text-red-200/25">
              ·
            </span>
            <span className="min-w-0 max-w-[200px] truncate font-medium normal-case tracking-normal text-red-50/90 sm:max-w-[260px]">
              {closedLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
