import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import { site } from "@/lib/data/site";

export default function LocationHours() {
  return (
    <section className="section bg-cream-100/50">
      <div className="container-base grid gap-10 sm:gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="eyebrow">Find us</p>
          <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:mt-4 sm:text-4xl lg:text-5xl">
            We are at The Riviera, Bahria Town.
          </h2>
          <p className="mt-3 text-coffee-600 sm:mt-4">
            Easy to find, easier to settle into. Free parking right outside,
            indoor and outdoor seating, and we are open late every night.
          </p>

          <ul className="mt-6 space-y-4 text-coffee-700 sm:mt-8 sm:space-y-5">
            <li className="group flex cursor-default gap-4 rounded-2xl p-2 transition-all duration-300 hover:-translate-x-0 hover:bg-cream-50">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-500 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
              <div>
                <p className="font-semibold text-coffee-800">Address</p>
                <p className="text-sm text-coffee-600">
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </p>
                <a
                  href={site.address.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline mt-1 inline-block text-sm font-semibold text-coffee-700 hover:text-coffee-900"
                >
                  Open in Google Maps →
                </a>
              </div>
            </li>
            <li className="group flex cursor-default gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-cream-50">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-gold-500 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
              <div>
                <p className="font-semibold text-coffee-800">Phone</p>
                <a
                  href={`tel:${site.contact.phone}`}
                  className="link-underline text-sm text-coffee-600 hover:text-coffee-800"
                >
                  {site.contact.phone}
                </a>
              </div>
            </li>
            <li className="group flex cursor-default gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-cream-50">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-gold-500 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
              <div>
                <p className="font-semibold text-coffee-800">Hours</p>
                <p className="text-sm text-coffee-600">
                  Open every day · 9:00 AM – 1:00 AM (Fri/Sat till 2:00 AM)
                </p>
              </div>
            </li>
            <li className="group flex cursor-default gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-cream-50">
              <Instagram className="mt-1 h-5 w-5 shrink-0 text-gold-500 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
              <div>
                <p className="font-semibold text-coffee-800">DM us anytime</p>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline text-sm text-coffee-600 hover:text-coffee-800"
                >
                  @meseta_pakistan
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="group card overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_30px_70px_-25px_rgba(66,41,26,0.4)] hover:ring-coffee-200">
            <iframe
              title="Meseta Coffee location"
              src={site.address.embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full border-0 transition-transform duration-700 ease-out group-hover:scale-[1.01] sm:h-[400px] lg:h-[480px]"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
