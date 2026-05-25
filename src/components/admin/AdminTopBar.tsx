"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { LogOut, Menu, Power, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/admin/auth";
import { useAdminUI } from "./AdminUIProvider";

export default function AdminTopBar({
  admin,
  isOpen,
  closedMessage,
  onToggle,
}: {
  admin: AdminUser;
  isOpen: boolean;
  closedMessage: string | null;
  onToggle: (next: boolean, message?: string) => Promise<void>;
}) {
  const [showReopen, setShowReopen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { openSidebar } = useAdminUI();
  const router = useRouter();

  function reopen() {
    startTransition(async () => {
      await onToggle(true);
      setShowReopen(false);
      // Without this, the topbar pill keeps showing "Closed" until the
      // next navigation even though the store IS open in the DB —
      // `revalidatePath` on the server invalidates the cache but the
      // current page won't re-fetch on its own.
      router.refresh();
    });
  }

  // Store-status pill behavior:
  //   • Open  → linkable to the Store-status page where the admin can
  //            craft a reason / reopening time before closing.
  //   • Closed → small reconfirmation modal that flips it back open with
  //            one click (no extra fields needed to reopen).
  const pillClasses = cn(
    "group inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 active:scale-[0.97]",
    isOpen
      ? "border-matcha-500/40 bg-matcha-500/10 text-matcha-700 hover:bg-matcha-500/20"
      : "border-red-400/50 bg-red-50 text-red-700 hover:bg-red-100",
  );

  const dot = (
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        isOpen
          ? "bg-matcha-500 shadow-[0_0_0_3px_rgba(95,122,59,0.2)]"
          : "bg-red-500",
      )}
    />
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-coffee-100 bg-cream-50/95 px-3 backdrop-blur sm:gap-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Hamburger — opens the mobile drawer */}
          <button
            type="button"
            aria-label="Open navigation"
            onClick={openSidebar}
            className="-ml-1 rounded-full p-2 text-coffee-700 transition hover:bg-coffee-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {isOpen ? (
            <Link
              href="/admin/store-status"
              className={pillClasses}
              title="Open the Store status page to close the store"
            >
              {dot}
              <span className="hidden sm:inline">Store open</span>
              <span className="sm:hidden">Open</span>
              <Settings2 className="ml-1 h-3 w-3 text-matcha-600/70 transition-transform duration-200 group-hover:rotate-12" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowReopen(true)}
              className={pillClasses}
            >
              {dot}
              <span className="hidden sm:inline">Store closed</span>
              <span className="sm:hidden">Closed</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden flex-col text-right md:flex">
            <span className="text-sm font-semibold text-coffee-800">
              {admin.full_name ?? admin.email}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-coffee-400">
              {admin.role}
            </span>
          </div>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex items-center gap-2 rounded-full border border-coffee-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-600 transition hover:border-coffee-700 hover:bg-coffee-700 hover:text-cream-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Reopen confirmation modal — only shown when currently closed.
          Portaled to <body> so it's always centred on the viewport and
          can never be shifted/clipped by the admin layout. */}
      {showReopen &&
        !isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-coffee-900/60 p-4 backdrop-blur-sm"
            onClick={() => setShowReopen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-auto w-full max-w-md rounded-3xl bg-cream-50 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-matcha-500/15 text-matcha-600">
                  <Power className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl text-coffee-800">
                  Reopen the store?
                </h2>
              </div>
              <p className="mt-3 text-sm text-coffee-500">
                Customers will be able to place orders immediately. The closed
                banner on the public site will disappear.
              </p>
              {closedMessage && (
                <p className="mt-3 rounded-xl bg-cream-100/70 p-3 text-xs text-coffee-500">
                  Was showing:{" "}
                  <span className="italic text-coffee-700">
                    &quot;{closedMessage}&quot;
                  </span>
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowReopen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-coffee-200 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-coffee-600 transition hover:bg-coffee-100 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={reopen}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-matcha-600 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-matcha-500 disabled:opacity-60 sm:w-auto"
                >
                  <Power className="h-4 w-4" />
                  {pending ? "Reopening…" : "Open store"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
