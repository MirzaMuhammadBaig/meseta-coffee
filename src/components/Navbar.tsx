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

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  return (
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

      <div
        className={cn(
          "grid overflow-hidden border-t border-coffee-100 bg-cream-50 transition-[grid-template-rows] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          <div className="container-base flex flex-col gap-1 py-3">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  data-press
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
          </div>
        </div>
      </div>
    </header>
  );
}
