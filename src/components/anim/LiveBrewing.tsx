"use client";

import { useEffect, useState } from "react";
import {
  nextWhenPhrase,
  useLiveStoreStatus,
} from "@/lib/store-status/useLiveStoreStatus";
import { cn } from "@/lib/utils";

/**
 * Hero activity badge.
 *
 *   • OPEN  — green "LIVE" pill: the live order count animates up from 0,
 *     then drifts ±1 every few seconds so the figure feels alive.
 *   • CLOSED — red "OFFLINE" pill: a warm reopen message instead of a
 *     fake order count (or the admin's custom close message).
 *
 * Both states sit on a breathing glow halo, green vs red.
 */

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function LiveBrewing({
  target = 3,
  duration = 1600,
}: {
  /** Order count the badge animates up to from zero. */
  target?: number;
  /** Easing duration for the initial count-up, in ms. */
  duration?: number;
}) {
  const status = useLiveStoreStatus();
  const open = status.open;

  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  // The badge lives in the hero (the landing view) — the count-up starts
  // on mount, never waiting for a scroll. Resets if the shop closes.
  useEffect(() => {
    if (!open) {
      setStarted(false);
      setValue(0);
      return;
    }
    setStarted(true);
  }, [open]);

  // Eased count-up from 0 → target.
  useEffect(() => {
    if (!open || !started) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, started, target, duration]);

  // Gentle ±1 drift so the count feels live (never below 2).
  useEffect(() => {
    if (!open || !started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setValue((v) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(2, Math.min(target + 2, v + delta));
      });
    }, 6000);
    return () => clearInterval(id);
  }, [open, started, target]);

  const closedMsg =
    status.reason === "manually_closed" && status.closedMessage?.trim()
      ? status.closedMessage
      : `We reopen ${nextWhenPhrase(status)}`;

  return (
    <div className="relative inline-flex max-w-full">
      {/* Breathing glow halo */}
      <span
        aria-hidden
        className={cn(
          "absolute -inset-2 rounded-full blur-lg animate-badge-glow motion-reduce:animate-none",
          open ? "bg-matcha-400/30" : "bg-red-500/30",
        )}
      />

      <div
        className={cn(
          "relative inline-flex max-w-full items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-md",
          open
            ? "border-matcha-400/20 bg-coffee-900/45 text-cream-100/85"
            : "border-red-400/25 bg-red-950/50 text-red-50/90",
        )}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-80",
              open ? "bg-matcha-400/80" : "bg-red-400/80",
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
            <span className="shrink-0 font-semibold tracking-[0.22em] text-matcha-400">
              LIVE
            </span>
            <span className="text-cream-100/70">
              Meseta is brewing{" "}
              <span className="font-semibold tabular-nums text-cream-50">
                {value}
              </span>{" "}
              order{value === 1 ? "" : "s"} right now
            </span>
          </>
        ) : (
          <>
            <span className="shrink-0 font-semibold tracking-[0.22em] text-red-300">
              OFFLINE
            </span>
            <span className="min-w-0 truncate normal-case tracking-normal text-red-50/80">
              {closedMsg}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
