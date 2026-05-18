"use client";

import { CreditCard, Wallet, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "card" | "cash";

const methods: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
  badge?: string;
}[] = [
  {
    value: "card",
    label: "Debit / Credit card",
    description: "Visa, Mastercard, Amex. Secured by Safepay.",
    icon: CreditCard,
    badge: "Recommended",
  },
  {
    value: "cash",
    label: "Cash on pickup",
    description: "Pay at the counter when you collect your order.",
    icon: Wallet,
  },
];

export default function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
        Payment method
      </legend>

      {methods.map((m) => {
        const active = m.value === value;
        return (
          <label
            key={m.value}
            className={cn(
              "group relative flex cursor-pointer items-start gap-4 rounded-2xl border bg-white p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(66,41,26,0.45)] sm:p-5",
              active
                ? "border-coffee-700 ring-2 ring-coffee-700/15"
                : "border-coffee-100 hover:border-coffee-300",
            )}
          >
            <input
              type="radio"
              name="payment_method"
              value={m.value}
              checked={active}
              onChange={() => onChange(m.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                active
                  ? "bg-coffee-700 text-cream-50"
                  : "bg-cream-100 text-coffee-700 group-hover:bg-coffee-100",
              )}
            >
              <m.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>

            <span className="flex flex-1 flex-col gap-1">
              <span className="flex items-center justify-between gap-3">
                <span className="font-display text-base text-coffee-800 sm:text-lg">
                  {m.label}
                </span>
                {m.badge && (
                  <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                    {m.badge}
                  </span>
                )}
              </span>
              <span className="text-xs text-coffee-500 sm:text-sm">
                {m.description}
              </span>
              {m.value === "card" && (
                <span className="mt-2 flex items-center gap-1.5 text-[11px] text-coffee-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-matcha-500" />
                  Encrypted 3-D Secure. Your card details never touch our
                  servers.
                </span>
              )}
            </span>

            {/* Visual selected ring */}
            <span
              aria-hidden
              className={cn(
                "absolute right-4 top-4 h-4 w-4 rounded-full border-2 transition-all duration-300",
                active
                  ? "border-coffee-700 bg-coffee-700 shadow-[inset_0_0_0_3px_rgba(251,247,241,1)]"
                  : "border-coffee-200",
              )}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
