"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  slug: string;
  name: string;
  price: number; // PKR
  qty: number;
};

type CartState = {
  lines: CartLine[];
  count: number; // total quantity
  subtotal: number; // sum of price * qty (raw, pre-discount — for display only)
  isOpen: boolean;
  /** Coupon code the customer has entered. Validated server-side. */
  couponCode: string | null;
  add: (item: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  setCouponCode: (code: string | null) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "meseta:cart:v1";
const COUPON_STORAGE_KEY = "meseta:cart:coupon:v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [couponCode, setCouponCodeState] = useState<string | null>(null);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed);
      }
      const cc = localStorage.getItem(COUPON_STORAGE_KEY);
      if (cc) setCouponCodeState(cc);
    } catch {
      // localStorage may be unavailable (Safari private mode) — fail silently
    }
    setHydrated(true);
  }, []);

  // Persist after every change (but not before initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // see above
    }
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (couponCode) localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      else localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [couponCode, hydrated]);

  const add = useCallback<CartState["add"]>((item, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === item.slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === item.slug ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const remove = useCallback<CartState["remove"]>((slug) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const setQty = useCallback<CartState["setQty"]>((slug, qty) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCodeState(null);
  }, []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const setCouponCode = useCallback<CartState["setCouponCode"]>((code) => {
    // Normalise to uppercase, treat empty as cleared.
    const v = code?.trim().toUpperCase() || null;
    setCouponCodeState(v);
  }, []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const l of lines) {
      count += l.qty;
      subtotal += l.qty * l.price;
    }
    return { count, subtotal };
  }, [lines]);

  const value = useMemo<CartState>(
    () => ({
      lines,
      count,
      subtotal,
      isOpen,
      couponCode,
      add,
      remove,
      setQty,
      setCouponCode,
      clear,
      open,
      close,
      toggle,
    }),
    [
      lines,
      count,
      subtotal,
      isOpen,
      couponCode,
      add,
      remove,
      setQty,
      setCouponCode,
      clear,
      open,
      close,
      toggle,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
