"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Multiplier: 0 = no movement, 0.3 = moves 30% of scroll. Negative inverts. */
  speed?: number;
  className?: string;
};

/**
 * GPU-friendly parallax wrapper.
 *
 * Uses a single rAF-throttled scroll listener and writes `translate3d(0, y, 0)`
 * on a ref'd element so the browser keeps it on a composited layer. Skipped
 * entirely under `prefers-reduced-motion`.
 *
 * Only applies the parallax while the element is visible (IntersectionObserver
 * gate), so off-screen sections don't burn CPU during scroll.
 */
export default function Parallax({ children, speed = 0.25, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const io = new IntersectionObserver((entries) => {
      inView.current = entries[0]?.isIntersecting ?? false;
    });
    io.observe(el);

    let ticking = false;
    const apply = () => {
      ticking = false;
      if (!el || !inView.current) return;
      const rect = el.getBoundingClientRect();
      // Distance from element midpoint to viewport midpoint.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const y = offset * speed * -1;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", apply);
    };
  }, [speed]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
