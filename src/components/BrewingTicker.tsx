"use client";

import { Coffee, Moon } from "lucide-react";
import Reveal from "@/components/anim/Reveal";
import {
  nextWhenPhrase,
  useLiveStoreStatus,
} from "@/lib/store-status/useLiveStoreStatus";
import { cn } from "@/lib/utils";

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

// When the shop is closed, the chips become "last seen" rather than "just now".
const QUIET_AGO = ["earlier", "this afternoon", "this morning", "yesterday"];

function OrderChip({ o, dim }: { o: Order; dim: boolean }) {
  return (
    <div
      className={cn(
        "flex w-[260px] shrink-0 items-center gap-3 rounded-full border border-coffee-100 bg-white py-2 pl-2 pr-4 shadow-[0_8px_22px_-14px_rgba(66,41,26,0.35)] sm:w-[300px] sm:pr-5",
        dim && "opacity-70 grayscale-[20%]",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm text-cream-50",
          dim ? "bg-coffee-500" : "bg-coffee-700",
        )}
      >
        {o.initials}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm">
          <span className="font-semibold text-coffee-800">{o.name}</span>
          <span className="text-coffee-500">
            {dim ? " ordered" : " just ordered"}
          </span>
        </p>
        <p className="truncate text-xs text-coffee-500">
          <span className="font-medium text-coffee-700">{o.item}</span>{" "}
          <span className="text-coffee-400">· {o.ago}</span>
        </p>
      </div>
    </div>
  );
}

function MarqueeRow({
  orders,
  reverse = false,
  duration = 40,
  paused = false,
  dim = false,
}: {
  orders: Order[];
  reverse?: boolean;
  duration?: number;
  paused?: boolean;
  dim?: boolean;
}) {
  // Doubling the list gives a seamless infinite loop with translateX(-50%).
  const doubled = [...orders, ...orders];
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-cream-50 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-cream-50 to-transparent sm:w-24" />
      <div
        className="flex w-max animate-marquee gap-4 motion-reduce:animate-none"
        style={{
          animationDuration: `${paused ? duration * 3 : duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((o, i) => (
          <OrderChip key={i} o={o} dim={dim} />
        ))}
      </div>
    </div>
  );
}

export default function BrewingTicker() {
  const status = useLiveStoreStatus();
  const open = status.open;

  // Reframe chips when closed — chips show "earlier" instead of "1 min ago".
  const reframedA = open
    ? rowA
    : rowA.map((o, i) => ({ ...o, ago: QUIET_AGO[i % QUIET_AGO.length] }));
  const reframedB = open
    ? rowB
    : rowB.map((o, i) => ({ ...o, ago: QUIET_AGO[i % QUIET_AGO.length] }));

  const closedSubline =
    status.reason === "manually_closed" && status.closedMessage?.trim()
      ? status.closedMessage
      : `We are closed right now — back ${nextWhenPhrase(status)}.`;

  return (
    <section className="relative overflow-hidden bg-cream-50 py-14 sm:py-20">
      {/* subtle gold blobs in the background */}
      <div
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl",
          open ? "bg-gold-500/10" : "bg-coffee-500/5",
        )}
      />

      <Reveal className="container-base">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  open ? "bg-matcha-500/80" : "bg-red-500/70",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  open ? "bg-matcha-600" : "bg-red-500",
                )}
              />
            </span>
            {open ? "Brewing right now" : "Quiet for now"}
          </p>
          <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl lg:text-5xl">
            {open
              ? "Always something on the counter."
              : "The bar is resting."}
          </h2>
          <p className="mt-3 text-coffee-600 sm:text-base">
            {open ? (
              <>
                Real orders flying out the door right this minute, from the
                regulars who can&apos;t go a day without us.
              </>
            ) : (
              closedSubline
            )}
          </p>
        </div>
      </Reveal>

      <div className="mt-10 space-y-4 sm:mt-14 sm:space-y-5">
        <MarqueeRow
          orders={reframedA}
          duration={45}
          paused={!open}
          dim={!open}
        />
        <MarqueeRow
          orders={reframedB}
          duration={50}
          reverse
          paused={!open}
          dim={!open}
        />
      </div>

      {/* Footer line: icon + status sentence. The text is wrapped in a
          <span> and the icon marked shrink-0 so on narrow screens the
          whole sentence wraps as a unit *next to* the icon, instead of
          the icon orphaning to its own line above wrapped text. */}
      <p className="mt-6 px-4 text-center text-xs uppercase tracking-[0.18em] text-coffee-400">
        <span className="inline-flex max-w-full items-center justify-center gap-2 align-middle">
          {open ? (
            <>
              <Coffee
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.8}
                aria-hidden
              />
              <span className="text-balance">
                Live from the bar · updated every minute
              </span>
            </>
          ) : (
            <>
              <Moon
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.8}
                aria-hidden
              />
              <span className="text-balance">
                Recent regulars · we reopen {nextWhenPhrase(status)}
              </span>
            </>
          )}
        </span>
      </p>
    </section>
  );
}
