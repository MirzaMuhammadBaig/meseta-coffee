import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import LocationHours from "@/components/LocationHours";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Meseta Coffee for bookings, events, catering, partnerships.",
};

const channels = [
  {
    icon: Phone,
    label: "Call us",
    value: site.contact.phone,
    href: `tel:${site.contact.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: site.contact.whatsapp,
    href: `https://wa.me/${site.contact.whatsapp.replace(/\D/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
  },
  {
    icon: MapPin,
    label: "Walk in",
    value: site.address.line1,
    href: site.address.mapsUrl,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="We are easy to reach."
        description="Reservations, events, catering, partnerships, or just a hello. We answer everything."
      />

      <section className="section">
        <div className="container-base grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="card-interactive group flex h-full flex-col gap-2 p-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-600 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-coffee-900">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-coffee-400">
                      {c.label}
                    </p>
                    <p className="font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900">
                      {c.value}
                    </p>
                  </a>
                </li>
              ))}
            </ul>

            <div className="card mt-6 p-6">
              <p className="eyebrow">Opening hours</p>
              <ul className="mt-4 divide-y divide-coffee-100 text-sm text-coffee-700">
                {site.hours.map((h) => (
                  <li
                    key={h.day}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span>{h.day}</span>
                    <span className="tabular-nums text-coffee-500">
                      {h.open} – {h.close}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <LocationHours />
    </>
  );
}
