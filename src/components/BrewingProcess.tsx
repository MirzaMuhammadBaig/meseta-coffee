import { Cog, Coffee, Flame, Sprout } from "lucide-react";
import Reveal from "@/components/anim/Reveal";

const steps = [
  {
    icon: Sprout,
    label: "Sourced",
    title: "Single-origin beans",
    body: "Hand-picked from boutique farms — Ethiopia, Colombia, Guatemala — rotated every six weeks.",
  },
  {
    icon: Flame,
    label: "Roasted",
    title: "Slow-roasted weekly",
    body: "Medium-dark profiles roasted just down the street, never more than seven days old.",
  },
  {
    icon: Cog,
    label: "Ground",
    title: "Ground to order",
    body: "Each shot ground fresh on a Mahlkönig — your cup isn't ground until you order it.",
  },
  {
    icon: Coffee,
    label: "Brewed",
    title: "Pulled by hand",
    body: "La Marzocco Linea, 30-second dialled-in pulls, milk steamed to 65°C. Always.",
  },
];

/** Tiny SVG coffee bean used as the "trail" between step icons. */
function Bean({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 28" fill="currentColor" className={className}>
      <ellipse cx="10" cy="14" rx="6.5" ry="12" />
      <path d="M10 4 Q11 14 10 24" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none" />
    </svg>
  );
}

export default function BrewingProcess() {
  return (
    <section className="relative overflow-hidden bg-coffee-800 py-16 text-cream-50 sm:py-24">
      {/* Atmosphere */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-matcha-500/15 blur-3xl" />

      <div className="container-base relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold-400">From bean to your cup</p>
          <h2 className="mt-3 font-display text-3xl text-cream-50 sm:mt-4 sm:text-4xl lg:text-5xl">
            Four steps. No shortcuts.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-cream-100/70 sm:mt-4 sm:text-base">
            Every cup at Meseta goes through the same thoughtful process — from
            the farm the beans came from to the second your barista hands it
            over the counter.
          </p>
        </Reveal>

        {/* Desktop horizontal flow */}
        <div className="relative mt-12 hidden lg:block">
          {/* Coffee-bean dotted trail running across the top of all 4 icons */}
          <div
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-9 flex items-center justify-between text-gold-400/50"
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <Bean
                key={i}
                className="h-3 w-2.5 origin-center rotate-[20deg] opacity-70"
              />
            ))}
          </div>

          <div className="relative grid grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal
                key={s.label}
                variant="scale"
                delay={i * 140}
                className="flex flex-col items-center text-center"
              >
                <div className="relative">
                  <span className="absolute -inset-3 rounded-full bg-gold-500/20 blur-xl" />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold-400/40 bg-coffee-900 text-gold-400 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
                    <s.icon className="h-8 w-8" strokeWidth={1.6} />
                  </span>
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 font-display text-xs font-bold text-coffee-900 shadow">
                    {i + 1}
                  </span>
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">
                  {s.label}
                </p>
                <h3 className="mt-2 font-display text-xl text-cream-50">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-cream-100/70">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="relative mt-10 space-y-7 lg:hidden">
          {/* Vertical bean trail */}
          <div
            aria-hidden
            className="absolute left-[28px] top-4 bottom-4 flex w-px flex-col items-center justify-between text-gold-400/40 sm:left-[34px]"
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <Bean key={i} className="h-2.5 w-2 -rotate-[8deg]" />
            ))}
          </div>

          {steps.map((s, i) => (
            <Reveal key={s.label} delay={i * 110} as="li" className="relative flex gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <span className="absolute -inset-2 rounded-full bg-gold-500/20 blur-xl" />
                <span className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full border border-gold-400/40 bg-coffee-900 text-gold-400 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] sm:h-[72px] sm:w-[72px]">
                  <s.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.6} />
                </span>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 font-display text-[10px] font-bold text-coffee-900 shadow sm:h-6 sm:w-6 sm:text-xs">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">
                  {s.label}
                </p>
                <h3 className="mt-1 font-display text-lg text-cream-50">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-cream-100/70">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
