"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

/**
 * Tracks whether the page has been scrolled past a threshold.
 * Uses a passive listener + rAF so it never blocks the main thread,
 * and a small threshold so the navbar doesn't flicker at y=0.
 */
function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useScrolled(16);

  // Close the mobile menu when navigating between routes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The mobile menu + backdrop below are `position: fixed`, so they
  // anchor to the viewport on their own. We deliberately do NOT lock
  // <body> scroll: `overflow: hidden` on <body> turns it into a scroll
  // container and detaches the `position: sticky` header, which would
  // shove the navbar off-screen when the menu is opened mid-scroll.

  return (
    <>
      <header
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out",
        scrolled
          ? "border-b border-coffee-100 bg-cream-50/95 shadow-[0_8px_24px_-16px_rgba(66,41,26,0.35)] backdrop-blur-md supports-[backdrop-filter]:bg-cream-50/80"
          : "border-b border-transparent bg-cream-50/85 backdrop-blur-sm supports-[backdrop-filter]:bg-cream-50/70",
      )}
    >
      <div
        className={cn(
          "container-base flex items-center justify-between transition-[height] duration-300 ease-out",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-2 font-display font-bold text-coffee-700 transition-all duration-300 hover:text-coffee-900"
        >
          <Coffee
            className={cn(
              "text-gold-500 transition-all duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110 group-active:scale-95",
              scrolled ? "h-6 w-6" : "h-7 w-7",
            )}
            strokeWidth={1.6}
          />
          <span
            className={cn(
              "transition-all duration-300 group-hover:translate-x-0.5",
              scrolled ? "text-xl" : "text-2xl",
            )}
          >
            Meseta
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-active={active}
                className={cn(
                  "link-underline text-sm font-medium tracking-wide transition-colors duration-200 hover:text-coffee-900",
                  active ? "text-coffee-900" : "text-coffee-600",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/reservations"
          className={cn(
            "btn-primary hidden md:inline-flex transition-all duration-300",
            scrolled ? "px-5 py-2.5 text-xs" : "px-6 py-3 text-sm",
          )}
        >
          Reserve a table
        </Link>

        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          data-press
          className="rounded-full p-2 text-coffee-700 transition-colors duration-200 hover:bg-coffee-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="relative h-6 w-6">
            <Menu
              className={cn(
                "absolute inset-0 h-6 w-6 transition-all duration-300 ease-out",
                open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
              )}
            />
            <X
              className={cn(
                "absolute inset-0 h-6 w-6 transition-all duration-300 ease-out",
                open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
              )}
            />
          </div>
        </button>
      </div>

    </header>

      {/* ── Mobile menu — fixed overlay ─────────────────────────────
          The backdrop + panel are fixed-position siblings of the
          header, so the menu is always anchored to the viewport. It
          can never be dragged off-screen by the header's sticky scroll
          context, no matter how far the page is scrolled. */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-coffee-900/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b border-coffee-100 bg-cream-50 shadow-[0_24px_48px_-24px_rgba(66,41,26,0.55)] transition-[transform,opacity] duration-300 ease-out md:hidden",
          scrolled ? "pt-16" : "pt-20",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0",
        )}
      >
        <nav className="container-base flex flex-col gap-1 py-3">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                data-press
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-coffee-100/60 text-coffee-900"
                    : "text-coffee-700 hover:bg-coffee-50 hover:text-coffee-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/reservations"
            onClick={() => setOpen(false)}
            className="btn-primary mx-1 mt-2 justify-center"
          >
            Reserve a table
          </Link>
        </nav>
      </div>
    </>
  );
}
