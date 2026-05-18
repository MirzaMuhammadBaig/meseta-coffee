import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ReservationForm from "@/components/ReservationForm";
import LocationHours from "@/components/LocationHours";

export const metadata: Metadata = {
  title: "Reserve a Table",
  description:
    "Book your table at Meseta Coffee. Free, instant, confirmed on WhatsApp.",
};

export default function ReservationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Book a table"
        title="Save your seat at Meseta."
        description="Tell us when, how many, and any special requests. We confirm on WhatsApp within the hour."
      />

      <section className="section">
        <div className="container-base grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl text-coffee-800">
              Good to know
            </h2>
            <ul className="mt-6 space-y-4 text-coffee-700">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
                <span>
                  Reservations are <strong>free</strong> and held for 15 minutes
                  past your slot.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
                <span>
                  Groups of <strong>8 or more</strong>? Mention it in the notes
                  and we will reserve the long table.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
                <span>
                  For <strong>birthdays</strong> or events, add a note and we will
                  prep a little something.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
                <span>
                  Walk-ins are always welcome. Booking just guarantees a table.
                </span>
              </li>
            </ul>

            <div className="card mt-10 p-6">
              <p className="eyebrow">Catering & private hire</p>
              <p className="mt-3 text-sm text-coffee-600">
                We host private parties, corporate breakfasts and pop-up events.
                Email{" "}
                <a
                  href="mailto:hello@mesetacoffee.com"
                  className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
                >
                  hello@mesetacoffee.com
                </a>{" "}
                for a custom quote.
              </p>
            </div>
          </div>

          <ReservationForm />
        </div>
      </section>

      <LocationHours />
    </>
  );
}
