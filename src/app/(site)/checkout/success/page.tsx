"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import { site } from "@/lib/data/site";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "MES-…";
  const { clear } = useCart();

  // Empty the cart now that the order is placed.
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <section className="bg-cream-50 py-16 sm:py-24">
      <div className="container-base">
        <div className="card mx-auto max-w-xl overflow-hidden">
          <div className="bg-gradient-to-br from-matcha-500/20 via-cream-100/50 to-gold-500/20 p-8 text-center sm:p-12">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-matcha-500 text-cream-50 shadow-[0_12px_30px_-10px_rgba(70,88,42,0.6)]">
              <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
            </div>
            <p className="eyebrow mt-6">Order confirmed</p>
            <h1 className="mt-3 font-display text-4xl text-coffee-800 sm:text-5xl">
              Thank you.
            </h1>
            <p className="mt-3 text-coffee-600">
              We have received your order and our team is on it.
            </p>
            <p className="mt-6 inline-flex flex-col items-center gap-1 rounded-2xl border border-coffee-100 bg-white px-5 py-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-coffee-400">
                Your order number
              </span>
              <span className="font-mono text-lg font-bold tracking-wider text-coffee-800">
                {orderNumber}
              </span>
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <ol className="space-y-3 text-sm text-coffee-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>
                  We will send a confirmation to your WhatsApp within a few
                  minutes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>
                  If you chose pickup, we will message when your order is
                  ready. Most orders are ready in 5 to 10 minutes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>
                  Keep the order number handy. You will need it if you need to
                  reach us.
                </span>
              </li>
            </ol>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/${site.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Meseta! Just placed order ${orderNumber}.`)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary flex-1 justify-center"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Meseta
              </a>
              <Link href="/menu" className="btn-ghost flex-1 justify-center">
                Browse the menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
