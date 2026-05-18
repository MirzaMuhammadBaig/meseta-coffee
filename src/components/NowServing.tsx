"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const items = [
  "Turkish Matcha",
  "Meseta Layered Latte",
  "Chipotle Chicken",
  "Walnut Fudge Brownie",
  "Spanish Latte",
  "Vanilla Sweet-Cream Cold Brew",
];

/** Small "Now serving" pill that cycles through current top items every 3s. */
export default function NowServing() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 250);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cream-100/25 bg-cream-50/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-cream-100/85 backdrop-blur sm:gap-2.5 sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em]">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha-400 opacity-80" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-matcha-500" />
      </span>
      <span className="shrink-0 text-cream-100/70">Now serving</span>
      <span
        className={
          "min-w-0 max-w-[120px] truncate font-semibold tracking-normal text-cream-50 transition-all duration-300 ease-out sm:max-w-[160px] " +
          (visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1")
        }
      >
        {items[idx]}
      </span>
      <Sparkles className="h-3 w-3 shrink-0 text-gold-400" strokeWidth={2} />
    </div>
  );
}
