"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "LIVE — Meseta is brewing N orders right now" pill that lives just below
 * the hero CTAs. The number counts up from 0 on first reveal, then drifts
 * up/down by a small delta every few seconds so it feels alive without
 * making the user question whether it's real.
 */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function LiveBrewing({
  target = 3,
  duration = 1600,
}: {
  /** Number the count animates up to from zero. */
  target?: number;
  /** Easing duration for the initial count-up, in ms. */
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  // Reveal → count up from 0 → target
  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      setStarted(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started, target]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  // Once the count-up settles, gently nudge ±1 every ~6s so the figure
  // feels "live" without ever showing 0.
  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setValue((v) => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        const next = v + delta;
        return Math.max(2, Math.min(target + 2, next));
      });
    }, 6000);
    return () => clearInterval(id);
  }, [started, target]);

  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-2.5 rounded-full border border-cream-100/15 bg-coffee-900/35 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-cream-100/85 backdrop-blur-md"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha-400/80 opacity-80" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-matcha-500" />
      </span>
      <span className="font-semibold tracking-[0.22em] text-matcha-400">LIVE</span>
      <span className="text-cream-100/70">
        Meseta is brewing{" "}
        <span className="font-semibold tabular-nums text-cream-50">{value}</span>{" "}
        order{value === 1 ? "" : "s"} right now
      </span>
    </div>
  );
}
