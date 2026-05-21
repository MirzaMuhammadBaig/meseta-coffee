"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

type Variant = "up" | "fade" | "left" | "right" | "scale";

const startTransform: Record<Variant, string> = {
  up: "translate3d(0, 32px, 0)",
  fade: "translate3d(0, 0, 0)",
  left: "translate3d(-32px, 0, 0)",
  right: "translate3d(32px, 0, 0)",
  scale: "translate3d(0, 16px, 0) scale(0.96)",
};

/**
 * Reveal-on-view that toggles visibility via IntersectionObserver
 * (cheap, no scroll listeners) and animates with GPU-friendly transforms.
 *
 * - Triggers once (disconnects observer after first hit) so re-scrolling
 *   doesn't re-play, keeping things calm on long pages.
 * - Honours `prefers-reduced-motion` by skipping the animation entirely.
 * - `immediate` plays the intro on mount instead of waiting for scroll —
 *   use it for above-the-fold content (e.g. the hero) that can sit just
 *   below the fold on shorter screens and should never need a scroll to
 *   appear.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 700,
  variant = "up",
  className,
  immediate = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  variant?: Variant;
  className?: string;
  immediate?: boolean;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user preference for reduced motion — skip entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    // Above-the-fold content reveals as soon as it mounts.
    if (immediate) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      // -10% bottom margin: trigger a touch before the element fully enters.
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <Tag
      ref={ref as never}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        transform: visible ? "none" : startTransform[variant],
        opacity: visible ? 1 : 0,
        willChange: visible ? "auto" : "transform, opacity",
      }}
      className={cn(
        "transition-[transform,opacity] ease-out motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
