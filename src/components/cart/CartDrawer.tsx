"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import { useStoreStatus } from "@/lib/store-status/StoreStatusProvider";
import { formatPkr, cn } from "@/lib/utils";

export default function CartDrawer() {
  const { lines, count, subtotal, isOpen, close, setQty, remove, clear } =
    useCart();
  const { isOpen: storeOpen, closedMessage } = useStoreStatus();

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Close with Escape key for keyboard users
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const empty = count === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-coffee-900/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream-50 shadow-2xl transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-coffee-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gold-500/15 p-2 text-gold-600">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="eyebrow">Your order</p>
              <p className="font-display text-lg text-coffee-800">
                {count} item{count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close order summary"
            onClick={close}
            data-press
            className="rounded-full p-2 text-coffee-600 transition-colors duration-200 hover:bg-coffee-100 hover:text-coffee-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-cream-100 p-5 text-coffee-300">
                <ShoppingBag className="h-8 w-8" strokeWidth={1.4} />
              </div>
              <p className="mt-5 font-display text-xl text-coffee-800">
                Your order is empty.
              </p>
              <p className="mt-2 max-w-xs text-sm text-coffee-500">
                Browse the menu and tap{" "}
                <span className="font-semibold text-coffee-700">Add</span> on
                any item to build your order.
              </p>
              <button
                type="button"
                onClick={close}
                className="btn-primary mt-6"
              >
                Browse the menu
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-coffee-100">
              {lines.map((l) => (
                <li
                  key={l.slug}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-coffee-800">
                      {l.name}
                    </p>
                    <p className="mt-0.5 text-xs text-coffee-500">
                      {formatPkr(l.price)} each
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-coffee-200 bg-white p-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${l.name}`}
                        onClick={() => setQty(l.slug, l.qty - 1)}
                        data-press
                        className="rounded-full p-1.5 text-coffee-700 transition-colors duration-200 hover:bg-coffee-100"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-coffee-800">
                        {l.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${l.name}`}
                        onClick={() => setQty(l.slug, l.qty + 1)}
                        data-press
                        className="rounded-full p-1.5 text-coffee-700 transition-colors duration-200 hover:bg-coffee-100"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="whitespace-nowrap text-sm font-semibold text-coffee-800">
                      {formatPkr(l.qty * l.price)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${l.name}`}
                      onClick={() => remove(l.slug)}
                      data-press
                      className="rounded-full p-1.5 text-coffee-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!empty && (
          <footer className="border-t border-coffee-100 bg-cream-100/40 p-5 sm:p-6">
            <dl className="flex items-baseline justify-between">
              <dt className="text-sm uppercase tracking-[0.18em] text-coffee-500">
                Subtotal
              </dt>
              <dd className="font-display text-2xl text-coffee-800">
                {formatPkr(subtotal)}
              </dd>
            </dl>

            {storeOpen ? (
              <>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-coffee-800 hover:shadow-[0_18px_36px_-14px_rgba(46,27,16,0.65)] active:translate-y-0 active:scale-[0.97]"
                >
                  <CreditCard className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6" />
                  Checkout · {formatPkr(subtotal)}
                </Link>

                <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[11px] text-coffee-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-matcha-500" />
                  Card payments secured by Safepay
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  aria-disabled
                  className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-coffee-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-coffee-500"
                >
                  <CreditCard className="h-4 w-4" />
                  Checkout unavailable
                </button>
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-[11px] text-red-700">
                  {closedMessage ?? "The store is closed for online orders right now."}
                </p>
              </>
            )}

            <button
              type="button"
              onClick={clear}
              className="mt-4 w-full rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] text-coffee-500 transition-colors duration-200 hover:text-red-600"
            >
              Clear order
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
