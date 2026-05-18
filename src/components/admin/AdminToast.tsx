"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating toast that reacts to ?saved=1 / ?error=... on any admin page.
 *
 * Why this exists: long admin pages (Settings, Store status) hide an
 * inline success banner under the fold once the user has scrolled, so
 * "Save" looks like a no-op. A fixed-position toast is visible no
 * matter where the user is on the page.
 */
export default function AdminToast() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const saved = params.get("saved");
  const error = params.get("error");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!saved && !error) {
      setVisible(false);
      return;
    }
    setVisible(true);

    // Auto-dismiss + clean the URL so refreshing doesn't re-show the toast.
    const t = setTimeout(() => {
      setVisible(false);
      const cleaned = new URLSearchParams(Array.from(params.entries()));
      cleaned.delete("saved");
      cleaned.delete("error");
      const qs = cleaned.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 3500);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, error]);

  if (!saved && !error) return null;

  const isError = !!error;
  const message = isError
    ? decodeURIComponent(error)
    : "Saved. Changes are live on the public site.";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed right-5 top-20 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-300 ease-out sm:right-8",
        visible
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-4 opacity-0",
        isError
          ? "border-red-200 bg-red-50/95 text-red-800"
          : "border-matcha-500/30 bg-matcha-500/15 text-matcha-800",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-cream-50",
          isError ? "bg-red-600" : "bg-matcha-600",
        )}
      >
        {isError ? (
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
        )}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
        className="-mr-1 -mt-1 rounded-full p-1 text-current opacity-60 transition hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
