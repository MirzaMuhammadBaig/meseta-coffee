import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="section">
      <div className="container-base">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-coffee-700 px-6 py-12 text-cream-50 sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-16 lg:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-matcha-500/20 blur-3xl" />

          <div className="relative grid items-end gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
            <div>
              <p className="eyebrow text-gold-400">Order or book a table</p>
              <h2 className="mt-3 font-display text-2xl leading-tight sm:mt-4 sm:text-4xl lg:text-5xl">
                Coffee at your door, or your favourite seat saved for tonight.
              </h2>
              <p className="mt-4 max-w-xl text-sm text-cream-100/80 sm:mt-5 sm:text-base">
                Pay securely by card and pick up in minutes, or save your seat
                for date-night. Reservations are free, and larger groups (8+)
                get the long table.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <Link href="/menu" className="btn-gold w-full sm:w-auto">
                Order coffee
              </Link>
              <Link
                href="/reservations"
                className="btn-ghost w-full border-cream-100/40 text-cream-50 hover:bg-cream-50 hover:text-coffee-800 sm:w-auto"
              >
                Reserve a table
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
