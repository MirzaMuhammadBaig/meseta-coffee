"use client";

import { Check, Lock, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import { useLiveStoreStatus } from "@/lib/store-status/useLiveStoreStatus";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  name: string;
  price: number;
  className?: string;
};

/**
 * Stop click/keyboard activation from bubbling up to a wrapping <a>.
 * This is how we keep the Add button working when nested inside a clickable card.
 */
function swallow(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export default function AddToOrderButton({ slug, name, price, className }: Props) {
  const { lines, add, setQty } = useCart();
  // `open` here is the *effective* state — the admin switch AND the
  // published hours. After-hours blocks add-to-cart just like a manual close.
  const { open: isOpen } = useLiveStoreStatus();
  const line = lines.find((l) => l.slug === slug);
  const qty = line?.qty ?? 0;

  if (!isOpen) {
    return (
      <span
        title="Store is currently closed"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-coffee-200 bg-cream-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-coffee-400",
          className,
        )}
      >
        <Lock className="h-3 w-3" />
        Closed
      </span>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={(e) => {
          swallow(e);
          add({ slug, name, price }, 1);
        }}
        className={cn(
          "group/add inline-flex items-center gap-1.5 rounded-full border border-coffee-700/30 bg-cream-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-coffee-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-coffee-700 hover:bg-coffee-700 hover:text-cream-50 hover:shadow-[0_10px_24px_-10px_rgba(46,27,16,0.5)] active:translate-y-0 active:scale-95",
          className,
        )}
        aria-label={`Add ${name} to order`}
      >
        <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-hover/add:rotate-90" />
        Add
      </button>
    );
  }

  return (
    <div
      onClick={swallow}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-coffee-700 bg-coffee-700 p-1 text-cream-50 shadow-[0_8px_20px_-8px_rgba(46,27,16,0.5)]",
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Decrease ${name}`}
        onClick={(e) => {
          swallow(e);
          setQty(slug, qty - 1);
        }}
        data-press
        className="rounded-full p-1 transition-colors duration-200 hover:bg-coffee-800"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="flex min-w-6 items-center justify-center gap-1 text-xs font-semibold tabular-nums">
        <Check className="h-3 w-3 text-gold-400" /> {qty}
      </span>
      <button
        type="button"
        aria-label={`Increase ${name}`}
        onClick={(e) => {
          swallow(e);
          setQty(slug, qty + 1);
        }}
        data-press
        className="rounded-full p-1 transition-colors duration-200 hover:bg-coffee-800"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
