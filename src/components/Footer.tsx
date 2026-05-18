import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Mail, Coffee } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { site } from "@/lib/data/site";

export default function Footer() {
  return (
    <footer className="mt-16 bg-coffee-800 text-cream-100 sm:mt-20">
      <div className="container-base grid gap-10 py-12 sm:grid-cols-2 sm:gap-12 sm:py-16 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="group flex items-center gap-2 font-display text-2xl font-bold text-cream-50 transition-colors duration-300 hover:text-gold-400"
          >
            <Coffee
              className="h-7 w-7 text-gold-400 transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110 group-active:scale-95"
              strokeWidth={1.6}
            />
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              Meseta
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/70">
            {site.shortDescription}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="icon-btn border border-cream-100/20 p-2 hover:border-gold-400"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="icon-btn border border-cream-100/20 p-2 hover:border-gold-400"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            Visit
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
            <li className="group flex gap-3 transition-colors duration-200 hover:text-cream-50">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <span>
                {site.address.line1}
                <br />
                {site.address.line2}
              </span>
            </li>
            <li className="group flex gap-3 transition-colors duration-200 hover:text-cream-50">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <a
                href={`tel:${site.contact.phone}`}
                className="link-underline"
              >
                {site.contact.phone}
              </a>
            </li>
            <li className="group flex gap-3 transition-colors duration-200 hover:text-cream-50">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <a
                href={`mailto:${site.contact.email}`}
                className="link-underline"
              >
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            Hours
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-cream-100/80">
            {site.hours.map((h) => (
              <li
                key={h.day}
                className="flex justify-between gap-4 rounded-md px-1 transition-colors duration-200 hover:bg-cream-100/5 hover:text-cream-50"
              >
                <span>{h.day.slice(0, 3)}</span>
                <span className="tabular-nums">
                  {h.open} – {h.close}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            Stay in the loop
          </h4>
          <p className="mt-4 text-sm text-cream-100/70">
            New menu drops, seasonal specials and members-only events. No spam.
          </p>
          <div className="mt-4">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container-base flex items-center justify-center py-6 text-xs text-cream-100/60">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
