"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function CheckoutCancelPage() {
  const params = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <section className="bg-cream-50 py-16 sm:py-24">
      <div className="container-base">
        <div className="card mx-auto max-w-xl overflow-hidden">
          <div className="bg-gradient-to-br from-gold-500/15 via-cream-100/40 to-coffee-100/40 p-8 text-center sm:p-12">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-coffee-700 text-cream-50 shadow-[0_12px_30px_-10px_rgba(46,27,16,0.6)]">
              <AlertCircle className="h-7 w-7" strokeWidth={2} />
            </div>
            <p className="eyebrow mt-6">Payment cancelled</p>
            <h1 className="mt-3 font-display text-4xl text-coffee-800 sm:text-5xl">
              No worries.
            </h1>
            <p className="mt-3 text-coffee-600">
              Your card was not charged and your cart is still saved. Try again
              when you're ready.
            </p>
            {orderNumber && (
              <p className="mt-5 text-xs text-coffee-400">
                Cancelled order reference:{" "}
                <span className="font-mono text-coffee-600">{orderNumber}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:p-8">
            <Link
              href="/checkout"
              className="btn-primary flex-1 justify-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Link>
            <Link href="/menu" className="btn-ghost flex-1 justify-center">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
