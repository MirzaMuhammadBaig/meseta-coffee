"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import { cn } from "@/lib/utils";

export default function CartFab() {
  const { count, open } = useCart();

  // Trigger a brief bounce whenever the cart count goes up (visual
  // confirmation that the Add tap registered, even if the user isn't
  // looking at the corner of the screen).
  const prevCount = useRef(count);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count > prevCount.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 450);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <button
      type="button"
      aria-label={`Open cart (${count} item${count === 1 ? "" : "s"})`}
      onClick={open}
      className={cn(
        "group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-coffee-800 px-5 py-3.5 text-cream-50 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ring-1 ring-coffee-900/40 transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-coffee-900 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.7)] active:translate-y-0 active:scale-95 sm:bottom-7 sm:right-7",
        count === 0
          ? "pointer-events-none translate-y-6 scale-90 opacity-0"
          : "translate-y-0 scale-100 opacity-100",
        pulse && "animate-cart-pulse",
      )}
    >
      <span className="relative">
        <ShoppingBag
          className="h-5 w-5 text-gold-400 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
          strokeWidth={1.8}
        />
        <span
          aria-hidden
          className={cn(
            "absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-coffee-900 ring-2 ring-coffee-800 transition-transform duration-300",
            pulse && "scale-125",
          )}
        >
          {count}
        </span>
      </span>
      <span className="text-sm font-semibold uppercase tracking-[0.18em]">
        View cart
      </span>
    </button>
  );
}
