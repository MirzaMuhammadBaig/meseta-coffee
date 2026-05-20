"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Site-wide click flourish.
 *
 * Listens (capture phase) for primary pointer-downs on anything
 * interactive — links, buttons, role=button, submit inputs, radio-card
 * labels, <summary>, or any [data-press] element — and paints a small
 * coffee-gold burst at the exact cursor point: a soft glow pop, an
 * expanding ring, and a fan of sparkle particles flung outward.
 *
 * The burst is drawn in a fixed, pointer-events-none overlay, so it works
 * on ANY element without that element needing `position: relative` or
 * `overflow: hidden`. Skipped entirely under prefers-reduced-motion.
 */

// `:has()` is modern (Chrome 105+, Safari 15.4+). Fall back gracefully on
// the rare engine without it so a bad selector never breaks real clicks.
const SUPPORTS_HAS =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("selector(:has(*))");

const INTERACTIVE = [
  "a[href]",
  "button",
  "[role='button']",
  "input[type='submit']",
  "input[type='button']",
  SUPPORTS_HAS ? "label:has(input)" : "label[for]",
  "summary",
  "[data-press]",
].join(",");

const PARTICLE_COUNT = 6;
const LIFETIME = 700; // ms — must outlast the longest keyframe below

type Spark = { id: number; x: number; y: number };

let uid = 0;

export default function ClickEffect() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const remove = useCallback((id: number) => {
    setSparks((list) => list.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return; // primary (left) click only
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>(INTERACTIVE);
      if (!el) return;
      // Don't celebrate a click that can't do anything.
      if (
        el.hasAttribute("disabled") ||
        el.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }
      const id = ++uid;
      setSparks((list) => [...list, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => remove(id), LIFETIME);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [remove]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      <style>{KEYFRAMES}</style>
      {sparks.map((s) => (
        <Burst key={s.id} x={s.x} y={s.y} />
      ))}
    </div>
  );
}

function Burst({ x, y }: { x: number; y: number }) {
  return (
    <>
      {/* Soft glow pop */}
      <span
        className="absolute block rounded-full bg-gold-400/50 blur-md"
        style={{
          left: x,
          top: y,
          width: 46,
          height: 46,
          animation: "ce-glow 460ms ease-out forwards",
        }}
      />
      {/* Expanding ring */}
      <span
        className="absolute block rounded-full border-2 border-gold-400"
        style={{
          left: x,
          top: y,
          width: 56,
          height: 56,
          animation: "ce-ring 600ms cubic-bezier(0.22,0.61,0.36,1) forwards",
        }}
      />
      {/* Sparkle particles fanned out around the click point */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (i % 2 ? 0.52 : 0);
        const dist = 24 + (i % 3) * 7;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        return (
          <span
            key={i}
            className={
              "absolute block rounded-full " +
              (i % 2 ? "bg-gold-500" : "bg-gold-400")
            }
            style={
              {
                left: x,
                top: y,
                width: 5,
                height: 5,
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                animation: `ce-particle 560ms ${i * 6}ms ease-out forwards`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </>
  );
}

const KEYFRAMES = `
@keyframes ce-glow {
  0%   { transform: translate(-50%,-50%) scale(0);    opacity: 0.55; }
  100% { transform: translate(-50%,-50%) scale(1.15); opacity: 0; }
}
@keyframes ce-ring {
  0%   { transform: translate(-50%,-50%) scale(0.25); opacity: 0.9; }
  70%  { opacity: 0.5; }
  100% { transform: translate(-50%,-50%) scale(1);    opacity: 0; }
}
@keyframes ce-particle {
  0%   { transform: translate(-50%,-50%) translate(0,0) scale(1);                   opacity: 1; }
  100% { transform: translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0.2); opacity: 0; }
}
`;
