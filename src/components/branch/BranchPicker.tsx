"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MapPin, Star, X } from "lucide-react";
import { useBranch } from "@/lib/branch/BranchProvider";
import { branchShortAddress, type Branch } from "@/lib/data/branches-helpers";
import { cn } from "@/lib/utils";

/**
 * Branch picker modal.
 *
 *   • Auto-opens on /menu and /menu/[slug] when the customer has not yet
 *     chosen a branch — the right moment to ask, because that is when
 *     they are about to order. The home page stays uninterrupted.
 *   • Item detail (/menu/[slug]) shows a contextual heading so the
 *     prompt reads as a natural pre-order step, not a generic gate.
 *   • Re-openable any time via the navbar chip → global
 *     `meseta:open-branch-picker` window event.
 *
 * Lives at the (site) layout level so it sits above every page.
 */

export const OPEN_EVENT = "meseta:open-branch-picker";

const ORDER_ROUTES = /^\/(menu|checkout|reservations)(\/|$)/;

export default function BranchPicker() {
  const { branches, currentBranchId, setBranchId, hasChosen, ready } =
    useBranch();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const onOrderRoute = useMemo(
    () => ORDER_ROUTES.test(pathname),
    [pathname],
  );
  const onItemPage = useMemo(
    () => /^\/menu\/[^/]+$/.test(pathname),
    [pathname],
  );

  // Auto-open only when the customer reaches an order-intent route
  // (menu / item / checkout / reservations) without having picked yet.
  // Home + about + contact stay quiet so the brand story is uninterrupted.
  useEffect(() => {
    if (!ready) return;
    if (hasChosen) return;
    if (branches.length <= 1) return;
    if (!onOrderRoute) return;
    setOpen(true);
  }, [ready, hasChosen, branches.length, onOrderRoute, pathname]);

  // External open trigger (navbar chip, switcher links, etc.).
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  if (branches.length === 0) return null;

  const pick = (id: string) => {
    setBranchId(id);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-picker-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-coffee-900/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-cream-50 shadow-[0_30px_80px_-20px_rgba(66,41,26,0.7)]">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-coffee-500 transition hover:bg-coffee-100 hover:text-coffee-800"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-coffee-100 bg-white px-6 py-5 sm:px-8 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">
            Choose a branch
          </p>
          <h2
            id="branch-picker-title"
            className="mt-2 font-display text-2xl text-coffee-800 sm:text-3xl"
          >
            {onItemPage
              ? "Choose a branch to continue ordering"
              : "Which Meseta are you ordering from?"}
          </h2>
          <p className="mt-1 text-sm text-coffee-500">
            {onItemPage
              ? "We need to know which outlet to send your order to. You can switch any time from the navbar."
              : "We have outlets across Rawalpindi. Pick the one closest to you. You can switch any time."}
          </p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:gap-4 sm:p-6">
          {branches.map((b) => (
            <BranchCard
              key={b.id}
              branch={b}
              selected={currentBranchId === b.id}
              onPick={() => pick(b.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BranchCard({
  branch,
  selected,
  onPick,
}: {
  branch: Branch;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-22px_rgba(66,41,26,0.4)] sm:p-5",
        selected
          ? "border-gold-500 ring-2 ring-gold-400/30"
          : "border-coffee-100 hover:border-coffee-300",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-500">
          <MapPin className="h-3 w-3 text-gold-500" />
          {branch.short_name ?? branch.city ?? "Branch"}
        </span>
        {branch.is_main && (
          <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold-700">
            Main
          </span>
        )}
      </div>

      <h3 className="font-display text-lg text-coffee-800 sm:text-xl">
        {branch.name.replace(/^Meseta Coffee\s*[—-]\s*/i, "")}
      </h3>

      <p className="text-xs text-coffee-500">
        {branchShortAddress(branch) || "Address coming soon"}
      </p>

      <div className="mt-1 flex items-center gap-2 text-xs text-coffee-600">
        <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
        <span className="font-semibold text-coffee-800">
          {branch.google_rating.toFixed(1)}
        </span>
        <span className="text-coffee-400">
          · {branch.google_review_count.toLocaleString()} reviews
        </span>
      </div>

      <span
        className={cn(
          "mt-3 inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
          selected
            ? "bg-gold-500 text-coffee-900"
            : "bg-coffee-700 text-cream-50 group-hover:bg-coffee-800",
        )}
      >
        {selected ? "Currently selected" : "Order from here"}
      </span>
    </button>
  );
}
