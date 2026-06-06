"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Printer,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import { useBranch } from "@/lib/branch/BranchProvider";
import { site } from "@/lib/data/site";

/**
 * Wrapper handles Suspense so `useSearchParams` doesn't trip the build's
 * static-prerender pass — the inner component is the real success view.
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessView />
    </Suspense>
  );
}

function SuccessView() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "MES-…";
  const fulfilment =
    params.get("fulfilment") === "delivery" ? "delivery" : "pickup";
  const payment = params.get("payment") === "card" ? "card" : "cash";
  const { clear } = useCart();
  const { current: currentBranch } = useBranch();

  // Empty the cart now that the order is placed.
  useEffect(() => {
    clear();
  }, [clear]);

  const isPickup = fulfilment === "pickup";
  const whatsappUrl = `https://wa.me/${site.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi Meseta! I just placed order ${orderNumber}.`,
  )}`;

  return (
    <section className="bg-cream-50 py-16 sm:py-24 print:py-8">
      <div className="container-base">
        <div className="card mx-auto max-w-xl overflow-hidden print:max-w-full print:shadow-none print:ring-0">
          {/* ─── Header band ─────────────────────────────────── */}
          <div className="bg-gradient-to-br from-matcha-500/20 via-cream-100/50 to-gold-500/20 p-8 text-center sm:p-12 print:bg-none print:p-6">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-matcha-500 text-cream-50 shadow-[0_12px_30px_-10px_rgba(70,88,42,0.6)] print:hidden">
              <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
            </div>
            <p className="eyebrow mt-6">Order confirmed</p>
            <h1 className="mt-3 font-display text-4xl text-coffee-800 sm:text-5xl">
              Thank you.
            </h1>
            <p className="mt-3 text-coffee-600">
              We have received your order and our team is on it.
            </p>

            <p className="mt-6 inline-flex flex-col items-center gap-1 rounded-2xl border border-coffee-100 bg-white px-5 py-3 print:border-coffee-800">
              <span className="text-[10px] uppercase tracking-[0.2em] text-coffee-400">
                Your order number
              </span>
              <span className="font-mono text-lg font-bold tracking-wider text-coffee-800">
                {orderNumber}
              </span>
            </p>

            <p className="mt-4 text-xs text-coffee-500">
              <strong className="text-coffee-700">Save this number.</strong>{" "}
              It is your reference if you need to reach us.
            </p>
          </div>

          {/* ─── What to expect ───────────────────────────────── */}
          <div className="p-6 sm:p-8 print:p-6">
            {/* Fulfilment summary chips */}
            <ul className="mb-6 grid gap-3 sm:grid-cols-2">
              <li className="flex items-start gap-3 rounded-xl bg-cream-100/60 p-3">
                {isPickup ? (
                  <Store className="mt-0.5 h-4 w-4 shrink-0 text-coffee-600" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coffee-600" />
                )}
                <div className="text-xs">
                  <p className="font-semibold uppercase tracking-[0.16em] text-coffee-400">
                    Fulfilment
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-coffee-800">
                    {isPickup
                      ? `Pickup at ${currentBranch?.short_name ?? currentBranch?.name ?? "Meseta"}`
                      : `Delivery from ${currentBranch?.short_name ?? currentBranch?.name ?? "Meseta"}`}
                  </p>
                  {currentBranch?.address_line1 && (
                    <p className="mt-0.5 text-xs text-coffee-500">
                      {currentBranch.address_line1}
                      {currentBranch.city ? `, ${currentBranch.city}` : ""}
                    </p>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl bg-cream-100/60 p-3">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-coffee-600" />
                <div className="text-xs">
                  <p className="font-semibold uppercase tracking-[0.16em] text-coffee-400">
                    Payment
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-coffee-800">
                    {payment === "card"
                      ? "Card (Safepay)"
                      : isPickup
                        ? "Cash on pickup"
                        : "Cash on delivery"}
                  </p>
                </div>
              </li>
            </ul>

            {/* What happens next — fulfilment-aware. No false promises. */}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-400">
              What happens next
            </p>
            <ol className="mt-3 space-y-3 text-sm text-coffee-600">
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                {isPickup ? (
                  <span>
                    Your order is being prepared now.{" "}
                    <span className="font-semibold text-coffee-800">
                      Ready in about 5 to 10 minutes.
                    </span>{" "}
                    Show your order number at the counter when you arrive.
                  </span>
                ) : (
                  <span>
                    Our team will start preparing your order and{" "}
                    <span className="font-semibold text-coffee-800">
                      call you on the phone you provided
                    </span>{" "}
                    when the rider is on the way.
                  </span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>
                  Any questions, changes or special requests? Message us on
                  WhatsApp with your order number and the team will help.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>
                  Want a record? Print or save this page — your order number is
                  the easiest way for us to look up your order later.
                </span>
              </li>
            </ol>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary flex-1 justify-center"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Meseta
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-ghost flex-1 justify-center"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print receipt
              </button>
            </div>

            <div className="mt-3 print:hidden">
              <Link
                href="/menu"
                className="block text-center text-xs uppercase tracking-[0.18em] text-coffee-500 hover:text-coffee-800"
              >
                ← Browse the menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
