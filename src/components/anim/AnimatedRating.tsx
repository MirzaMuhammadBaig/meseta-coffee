"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

/**
 * Hero rating + review-count widget that animates from zero up to the
 * brand's real numbers as the viewport reveals it.
 *
 *   • Rating (e.g. 4.5) eases up from 0 with `easeOutCubic`.
 *   • Stars fill left-to-right via a clipped gold overlay whose width
 *     tracks the current rating (so half-stars look right, not chunky).
 *   • Review count counts up from 0 to its target in lock-step.
 *
 * The fill begins once the widget scrolls into view.
 */

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedRating({
  rating,
  reviewCount,
  duration = 4200,
}: {
  rating: number;
  reviewCount: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0 → 1
  const [started, setStarted] = useState(false);

  // The slow star-fill is a core part of the hero experience, so it plays
  // for everyone — it's a gentle, non-flashing effect, not the kind that
  // reduce-motion is meant to suppress.
  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;

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
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (progress >= 1) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // We deliberately only re-run when `started` flips — the rAF loop
    // drives `progress` itself and shouldn't restart on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, duration]);

  const currentRating = rating * progress;
  const currentCount = Math.round(reviewCount * progress);
  // Star fill = current rating ÷ 5, expressed as a percentage so the
  // gold overlay grows smoothly left-to-right.
  const fillPercent = (currentRating / 5) * 100;

  return (
    <div
      ref={ref}
      className="group/stars flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cream-100/80 sm:gap-x-6"
    >
      <div className="relative inline-flex items-center gap-1.5" aria-hidden>
        {/* Layer 1 — empty star outlines */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={`bg-${i}`}
              className="h-4 w-4 text-cream-100/30"
              strokeWidth={1.8}
            />
          ))}
        </div>
        {/* Layer 2 — gold-filled stars clipped to the current width */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-100 ease-linear"
          style={{ width: `${fillPercent}%` }}
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`fg-${i}`}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="h-4 w-4 shrink-0 fill-gold-400 text-gold-400 transition-transform duration-300 ease-out group-hover/stars:-translate-y-0.5 group-hover/stars:scale-110"
                strokeWidth={1.8}
              />
            ))}
          </div>
        </div>
      </div>

      <span className="whitespace-nowrap tabular-nums">
        <span
          className="font-semibold text-cream-50"
          aria-label={`Rated ${rating} out of 5 stars`}
        >
          {currentRating.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>{" "}
        ·{" "}
        <span className="tabular-nums">
          {currentCount.toLocaleString()}
        </span>{" "}
        Google reviews
      </span>
    </div>
  );
}
