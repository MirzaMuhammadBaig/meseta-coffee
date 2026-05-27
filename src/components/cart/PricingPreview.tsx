"use client";

import { useEffect, useState } from "react";
import { Loader2, Tag, TicketPercent, X } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import { formatPkr, cn } from "@/lib/utils";

/**
 * Shared coupon input + live totals block.
 *
 * The cart drawer and the checkout page both use this so customers see
 * the exact same breakdown wherever they look. Driven by the server-side
 * /api/cart/preview — no client-side discount math anywhere.
 */

type PricedCart = {
  lines: {
    slug: string;
    qty: number;
    unit_price_pkr: number;
    discounted_unit_price_pkr: number;
    deal_title: string | null;
  }[];
  raw_subtotal_pkr: number;
  subtotal_pkr: number;
  deal_discount_pkr: number;
  coupon_discount_pkr: number;
  total_pkr: number;
  applied_coupon: { code: string; description: string | null; discount_pkr: number } | null;
  notices: string[];
};

export function usePricingPreview(): {
  priced: PricedCart | null;
  loading: boolean;
} {
  const { lines, couponCode } = useCart();
  const [priced, setPriced] = useState<PricedCart | null>(null);
  const [loading, setLoading] = useState(false);

  // Re-price whenever the cart contents or coupon code change.
  // 300ms debounce so typing a code doesn't fire one request per keystroke.
  useEffect(() => {
    if (lines.length === 0) {
      setPriced(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
            couponCode,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as PricedCart;
          setPriced(data);
        }
      } catch {
        /* ignore — keep last good preview */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [lines, couponCode]);

  return { priced, loading };
}

export function CouponInput({
  priced,
  loading,
}: {
  priced: PricedCart | null;
  loading: boolean;
}) {
  const { couponCode, setCouponCode } = useCart();
  const [draft, setDraft] = useState(couponCode ?? "");

  useEffect(() => {
    setDraft(couponCode ?? "");
  }, [couponCode]);

  function apply() {
    setCouponCode(draft || null);
  }

  function clear() {
    setDraft("");
    setCouponCode(null);
  }

  const noticeForCoupon =
    couponCode && !priced?.applied_coupon
      ? priced?.notices.find((n) => n.includes(couponCode)) ?? priced?.notices[0]
      : null;

  const applied = priced?.applied_coupon ?? null;

  return (
    <div className="rounded-2xl border border-coffee-100 bg-cream-50/40 p-3">
      <label
        htmlFor="cart-coupon"
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-500"
      >
        <TicketPercent className="h-3.5 w-3.5" />
        Coupon code
      </label>

      <div className="mt-2 flex items-stretch gap-2">
        <input
          id="cart-coupon"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          spellCheck={false}
          autoCapitalize="characters"
          autoCorrect="off"
          placeholder="WELCOME10"
          className="flex-1 rounded-xl border border-coffee-100 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wider text-coffee-800 placeholder:text-coffee-300 focus:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
        />
        {applied ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-xl border border-coffee-200 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-coffee-600 transition hover:border-red-200 hover:text-red-700"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={apply}
            disabled={loading || !draft || draft === couponCode}
            className="inline-flex items-center justify-center rounded-xl bg-coffee-700 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-cream-50 transition hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
          </button>
        )}
      </div>

      {applied && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-matcha-500/15 px-2.5 py-1 text-[11px] font-semibold text-matcha-700">
          <Tag className="h-3 w-3" />
          {applied.code} applied — saving {formatPkr(applied.discount_pkr)}
          {applied.description ? ` · ${applied.description}` : ""}
        </p>
      )}

      {noticeForCoupon && (
        <p className="mt-2 text-[11px] text-red-700">{noticeForCoupon}</p>
      )}
    </div>
  );
}

export function CartTotals({
  priced,
  loading,
  highlightTotal,
}: {
  priced: PricedCart | null;
  loading: boolean;
  /** Make the Total row larger (use in checkout summary, not in drawer). */
  highlightTotal?: boolean;
}) {
  // When the preview hasn't returned yet, fall back to a simple subtotal so
  // the drawer never flashes a blank state.
  const { lines } = useCart();
  const fallback = lines.reduce((s, l) => s + l.qty * l.price, 0);

  const subtotal = priced?.subtotal_pkr ?? fallback;
  const dealDiscount = priced?.deal_discount_pkr ?? 0;
  const couponDiscount = priced?.coupon_discount_pkr ?? 0;
  const total = priced?.total_pkr ?? fallback;

  return (
    <dl className="space-y-2 text-sm">
      <Row label="Subtotal" value={formatPkr(priced?.raw_subtotal_pkr ?? fallback)} muted />
      {dealDiscount > 0 && (
        <Row
          label="Deal savings"
          value={`− ${formatPkr(dealDiscount)}`}
          tone="positive"
        />
      )}
      {dealDiscount > 0 && (
        <Row label="After deals" value={formatPkr(subtotal)} muted />
      )}
      {couponDiscount > 0 && (
        <Row
          label={`Coupon ${priced?.applied_coupon?.code ?? ""}`}
          value={`− ${formatPkr(couponDiscount)}`}
          tone="positive"
        />
      )}
      <div
        className={cn(
          "mt-2 flex items-baseline justify-between border-t border-dashed border-coffee-100 pt-2.5",
          loading && "opacity-70",
        )}
      >
        <dt
          className={cn(
            "uppercase tracking-[0.18em] text-coffee-500",
            highlightTotal ? "text-xs" : "text-[11px]",
          )}
        >
          Total
        </dt>
        <dd
          className={cn(
            "font-display tabular-nums text-coffee-800",
            highlightTotal ? "text-2xl" : "text-lg",
          )}
        >
          {formatPkr(total)}
        </dd>
      </div>
    </dl>
  );
}

function Row({
  label,
  value,
  muted,
  tone,
}: {
  label: string;
  value: string;
  muted?: boolean;
  tone?: "positive";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt
        className={cn(
          "text-xs",
          muted ? "text-coffee-500" : "text-coffee-700",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          tone === "positive"
            ? "text-sm font-semibold text-matcha-700"
            : muted
              ? "text-sm text-coffee-700"
              : "text-sm font-semibold text-coffee-800",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
