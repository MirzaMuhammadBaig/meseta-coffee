import { Coffee } from "lucide-react";
import Reveal from "@/components/anim/Reveal";

type Order = { initials: string; name: string; item: string; ago: string };

// Two rows of "live" orders — purely for social-proof flavour.
// The names + items rotate every few months as part of normal copy refresh.
const rowA: Order[] = [
  { initials: "AF", name: "Aiman",   item: "Turkish Matcha",          ago: "1 min" },
  { initials: "MK", name: "Mustafa", item: "Walnut Fudge Brownie",    ago: "2 min" },
  { initials: "SR", name: "Shajee",  item: "Chipotle Sandwich",       ago: "3 min" },
  { initials: "HA", name: "Hassan",  item: "Classic Cold Brew",       ago: "4 min" },
  { initials: "SM", name: "Sara",    item: "Meseta Layered Latte",    ago: "5 min" },
  { initials: "BL", name: "Bilal",   item: "Spanish Latte",           ago: "6 min" },
  { initials: "ZK", name: "Zaina",   item: "Strawberry Matcha",       ago: "7 min" },
];

const rowB: Order[] = [
  { initials: "AR", name: "Ahmer",    item: "Truffle Mushroom Melt",         ago: "1 min" },
  { initials: "FS", name: "Fatima",   item: "Vanilla Sweet-Cream Cold Brew", ago: "2 min" },
  { initials: "NS", name: "Nimra",    item: "Cappuccino",                    ago: "3 min" },
  { initials: "OK", name: "Osama",    item: "Almond Croissant",              ago: "4 min" },
  { initials: "RH", name: "Rabia",    item: "Caramel Macchiato",             ago: "5 min" },
  { initials: "TN", name: "Talha",    item: "Tiramisu",                      ago: "6 min" },
  { initials: "IK", name: "Iman",     item: "Iced Jasmine Tea",              ago: "7 min" },
];

function OrderChip({ o }: { o: Order }) {
  return (
    <div className="flex w-[260px] shrink-0 items-center gap-3 rounded-full border border-coffee-100 bg-white py-2 pl-2 pr-4 shadow-[0_8px_22px_-14px_rgba(66,41,26,0.35)] sm:w-[300px] sm:pr-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coffee-700 font-display text-sm text-cream-50">
        {o.initials}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm">
          <span className="font-semibold text-coffee-800">{o.name}</span>
          <span className="text-coffee-500"> just ordered</span>
        </p>
        <p className="truncate text-xs text-coffee-500">
          <span className="font-medium text-coffee-700">{o.item}</span>{" "}
          <span className="text-coffee-400">· {o.ago} ago</span>
        </p>
      </div>
    </div>
  );
}

function MarqueeRow({
  orders,
  reverse = false,
  duration = 40,
}: {
  orders: Order[];
  reverse?: boolean;
  duration?: number;
}) {
  // Doubling the list gives a seamless infinite loop with translateX(-50%).
  const doubled = [...orders, ...orders];
  return (
    <div className="relative overflow-hidden">
      {/* Soft gradient fades on each edge to mask the seam */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-cream-50 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-cream-50 to-transparent sm:w-24" />
      <div
        className="flex w-max animate-marquee gap-4 motion-reduce:animate-none"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((o, i) => (
          <OrderChip key={i} o={o} />
        ))}
      </div>
    </div>
  );
}

export default function BrewingTicker() {
  return (
    <section className="relative overflow-hidden bg-cream-50 py-14 sm:py-20">
      {/* subtle gold blobs in the background */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />

      <Reveal className="container-base">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha-500/80 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-matcha-600" />
            </span>
            Brewing right now
          </p>
          <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl lg:text-5xl">
            Always something on the counter.
          </h2>
          <p className="mt-3 text-coffee-600 sm:text-base">
            Real orders flying out the door right this minute, from the regulars
            who can't go a day without us.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 space-y-4 sm:mt-14 sm:space-y-5">
        <MarqueeRow orders={rowA} duration={45} />
        <MarqueeRow orders={rowB} duration={50} reverse />
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-coffee-400">
        <Coffee className="h-3.5 w-3.5" strokeWidth={1.8} />
        Live from the bar · updated every minute
      </p>
    </section>
  );
}
