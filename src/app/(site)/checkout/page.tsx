"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MapPin,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import {
  closedReasonMessage,
  useLiveStoreStatus,
} from "@/lib/store-status/useLiveStoreStatus";
import PaymentMethodPicker, {
  type PaymentMethod,
} from "@/components/checkout/PaymentMethodPicker";
import { cn, formatPkr } from "@/lib/utils";

const lettersOnly = /[^a-zA-Z\s'\-\.]/g;
const phoneChars = /[^0-9+\s()\-]/g;
function sanitize(e: React.ChangeEvent<HTMLInputElement>, pattern: RegExp) {
  const cleaned = e.target.value.replace(pattern, "");
  if (e.target.value !== cleaned) e.target.value = cleaned;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, count, subtotal, clear } = useCart();
  // Effective open state — admin switch combined with published hours.
  const storeStatus = useLiveStoreStatus();
  const storeOpen = storeStatus.open;

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the cart empties (e.g. user clears it from the drawer), bounce back to /menu
  useEffect(() => {
    if (count === 0 && !submitting) {
      // small delay so we don't fight a navigation that's already happening
      const t = setTimeout(() => router.replace("/menu"), 0);
      return () => clearTimeout(t);
    }
  }, [count, submitting, router]);

  const summary = useMemo(
    () => ({
      itemsCount: count,
      subtotal,
      total: subtotal, // No tax/delivery yet — display column matches subtotal
    }),
    [count, subtotal],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!storeOpen) {
      setError(closedReasonMessage(storeStatus));
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      notes: fd.get("notes"),
      fulfilment,
      address: fulfilment === "delivery" ? fd.get("address") : null,
      payment_method: method,
      items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not place order.");

      if (data.payment_method === "card" && data.checkout_url) {
        // Hand off to Safepay's hosted checkout. We don't clear the cart
        // here — only on successful redirect back, so the user can retry
        // if they cancel.
        window.location.href = data.checkout_url;
        return;
      }

      // Cash → straight to success
      clear();
      router.push(`/checkout/success?order=${data.order_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (count === 0) {
    // Render nothing while the redirect effect fires
    return null;
  }

  return (
    <section className="bg-cream-50 py-10 sm:py-14 lg:py-20">
      <div className="container-base">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-coffee-500 transition-colors duration-200 hover:text-coffee-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </Link>

        <h1 className="mt-4 font-display text-4xl text-coffee-800 sm:text-5xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-coffee-500">
          One more step. Pay securely and we will have your order ready in
          minutes.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          {/* ─── Form column ───────────────────────────── */}
          <form onSubmit={onSubmit} className="grid gap-6">
            {/* Contact */}
            <div className="card grid gap-5 p-6 sm:p-7">
              <header>
                <p className="eyebrow">Step 1</p>
                <h2 className="mt-2 font-display text-2xl text-coffee-800">
                  Your details
                </h2>
              </header>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                    Full name
                  </label>
                  <input
                    name="name"
                    required
                    type="text"
                    inputMode="text"
                    autoComplete="name"
                    maxLength={60}
                    className="input mt-2"
                    onChange={(e) => sanitize(e, lettersOnly)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                    Phone (WhatsApp)
                  </label>
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="+92 ..."
                    className="input mt-2"
                    onChange={(e) => sanitize(e, phoneChars)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                  Email (optional, for the receipt)
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="input mt-2"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Fulfilment */}
            <div className="card grid gap-5 p-6 sm:p-7">
              <header>
                <p className="eyebrow">Step 2</p>
                <h2 className="mt-2 font-display text-2xl text-coffee-800">
                  How would you like your order?
                </h2>
              </header>

              <div className="grid gap-3 sm:grid-cols-2">
                <FulfilmentChoice
                  active={fulfilment === "pickup"}
                  onClick={() => setFulfilment("pickup")}
                  icon={Store}
                  title="Pickup"
                  body="Collect from our counter at The Riviera."
                />
                <FulfilmentChoice
                  active={fulfilment === "delivery"}
                  onClick={() => setFulfilment("delivery")}
                  icon={MapPin}
                  title="Delivery"
                  body="Within Bahria Town. Driver coordinates on WhatsApp."
                />
              </div>

              {fulfilment === "delivery" && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                    Delivery address
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="House #, Street, Sector"
                    className="input mt-2 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="card grid gap-5 p-6 sm:p-7">
              <header>
                <p className="eyebrow">Step 3</p>
                <h2 className="mt-2 font-display text-2xl text-coffee-800">
                  How would you like to pay?
                </h2>
              </header>

              <PaymentMethodPicker
                value={method}
                onChange={setMethod}
                fulfilment={fulfilment}
              />
            </div>

            {/* Notes */}
            <div className="card grid gap-5 p-6 sm:p-7">
              <header>
                <p className="eyebrow">Anything we should know?</p>
                <h2 className="mt-2 font-display text-2xl text-coffee-800">
                  Notes for the kitchen (optional)
                </h2>
              </header>
              <textarea
                name="notes"
                rows={3}
                placeholder="Allergies, dietary preferences, special occasion…"
                className="input resize-none"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-2 text-xs text-coffee-400">
                <Lock className="h-3.5 w-3.5" />
                Encrypted in transit · No data sold or shared.
              </p>
              <button
                type="submit"
                disabled={submitting || !storeOpen}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-coffee-800 hover:shadow-[0_18px_36px_-14px_rgba(46,27,16,0.65)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-coffee-300 disabled:hover:translate-y-0 disabled:hover:bg-coffee-300 disabled:hover:shadow-none"
              >
                {!storeOpen ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Store closed
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order
                  </>
                ) : (
                  <>
                    {method === "card"
                      ? `Pay ${formatPkr(summary.total)}`
                      : `Place order · ${formatPkr(summary.total)}`}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ─── Order summary column ─────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-coffee-100 bg-cream-100/40 p-5">
                <span className="rounded-full bg-gold-500/15 p-2 text-gold-600">
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="eyebrow">Your order</p>
                  <p className="font-display text-lg text-coffee-800">
                    {summary.itemsCount} item
                    {summary.itemsCount === 1 ? "" : "s"}
                  </p>
                </div>
              </header>

              <ul className="max-h-80 overflow-y-auto divide-y divide-coffee-100">
                {lines.map((l) => (
                  <li
                    key={l.slug}
                    className="flex items-start justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-coffee-800">
                        {l.name}
                      </p>
                      <p className="mt-0.5 text-xs text-coffee-400">
                        {l.qty} × {formatPkr(l.price)}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-coffee-700">
                      {formatPkr(l.qty * l.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="grid gap-2 border-t border-coffee-100 p-5 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-coffee-500">Subtotal</dt>
                  <dd className="tabular-nums text-coffee-800">
                    {formatPkr(summary.subtotal)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-coffee-500">Delivery</dt>
                  <dd className="text-xs text-coffee-400">
                    {fulfilment === "delivery"
                      ? "Calculated on WhatsApp"
                      : "Free pickup"}
                  </dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-coffee-100 pt-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-coffee-500">
                    Total
                  </dt>
                  <dd className="font-display text-2xl text-coffee-800">
                    {formatPkr(summary.total)}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-4 text-center text-[11px] text-coffee-400">
              Powered by Safepay · 3-D Secure · PCI DSS Level 1
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function FulfilmentChoice({
  active,
  onClick,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(66,41,26,0.45)]",
        active
          ? "border-coffee-700 ring-2 ring-coffee-700/15"
          : "border-coffee-100 hover:border-coffee-300",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
          active
            ? "bg-coffee-700 text-cream-50"
            : "bg-cream-100 text-coffee-700 group-hover:bg-coffee-100",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span>
        <span className="block font-display text-base text-coffee-800">
          {title}
        </span>
        <span className="block text-xs text-coffee-500">{body}</span>
      </span>
    </button>
  );
}
