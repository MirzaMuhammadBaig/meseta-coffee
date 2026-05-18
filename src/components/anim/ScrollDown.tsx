"use client";

import { ChevronDown } from "lucide-react";

/**
 * Subtle "scroll to explore" indicator at the bottom of the hero.
 * Disappears as the user scrolls past the hero (driven by IntersectionObserver
 * on the parent hero section), so it doesn't linger over the next section.
 */
export default function ScrollDown() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 motion-reduce:animate-none"
    >
      <div className="flex flex-col items-center gap-2 text-cream-100/60">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">
          Scroll
        </span>
        <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-cream-100/40 pt-1.5">
          <span className="h-1.5 w-1 animate-scroll-dot rounded-full bg-cream-50/80" />
        </span>
        <ChevronDown
          className="h-3 w-3 animate-bounce-slow opacity-60"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
