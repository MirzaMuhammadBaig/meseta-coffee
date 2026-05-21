import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/data/site";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import HeroBeans from "@/components/anim/HeroBeans";
import HeroSteam from "@/components/anim/HeroSteam";
import HeroCup from "@/components/anim/HeroCup";
import StoreStatusBadge from "@/components/anim/StoreStatusBadge";
import AnimatedRating from "@/components/anim/AnimatedRating";
import LiveBrewing from "@/components/anim/LiveBrewing";

export default function Hero() {
  return (
    <section className="group/hero relative overflow-hidden bg-coffee-800 text-cream-50">
      {/* Background image with subtle scroll-driven parallax */}
      <Parallax speed={0.18} className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1800&q=80"
          alt=""
          fill
          priority
          className="scale-110 object-cover opacity-25 transition-transform duration-[2.5s] ease-out group-hover/hero:scale-[1.15]"
        />
      </Parallax>

      <div className="absolute inset-0 bg-hero-grain opacity-90" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-coffee-900/75 via-coffee-800/70 to-coffee-900/95" />

      {/* Coffee-themed decorations */}
      <HeroBeans />
      <HeroSteam />

      <div className="container-base relative grid min-h-[calc(100svh-5rem)] items-center gap-10 py-16 sm:min-h-[80vh] sm:py-20 lg:min-h-[88vh] lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:py-24">
        <div className="max-w-3xl">
          {/* The hero IS the landing view — every piece reveals on load
              (`immediate`), never on scroll, so nothing sits invisible
              below the fold waiting for a scroll. */}
          <Reveal immediate delay={0} duration={700}>
            <StoreStatusBadge />
          </Reveal>

          <Reveal immediate as="h1" duration={900} delay={100}>
            <span className="mt-5 block font-display text-[2.5rem] leading-[1.05] text-cream-50 sm:mt-6 sm:text-6xl lg:text-7xl">
              Eatertainment,
              <br />
              <span className="italic text-gold-400">brewed daily.</span>
            </span>
          </Reveal>

          <Reveal immediate delay={250}>
            <p className="mt-5 max-w-xl text-base text-cream-100/85 sm:mt-6 sm:text-lg lg:text-xl">
              Specialty coffee, Turkish matcha, hand-pressed sandwiches and a
              board-game on every table. Rated{" "}
              <span className="font-semibold text-cream-50">
                {site.stats.googleRating}★
              </span>{" "}
              by {site.stats.googleReviewCount.toLocaleString()}+ guests on Google.
            </p>
          </Reveal>

          <Reveal immediate delay={400}>
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
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
          </Reveal>

          <Reveal immediate delay={500}>
            <div className="mt-6 sm:mt-8">
              <LiveBrewing target={3} />
            </div>
          </Reveal>

          <Reveal immediate delay={650}>
            <div className="mt-6 sm:mt-8">
              <AnimatedRating
                rating={site.stats.googleRating}
                reviewCount={site.stats.googleReviewCount}
              />
            </div>
          </Reveal>
        </div>

        {/* Animated coffee cup — large beside text on desktop, below on mobile */}
        <Reveal
          immediate
          variant="scale"
          duration={1100}
          delay={400}
          className="mx-auto flex justify-center lg:justify-end"
        >
          <HeroCup />
        </Reveal>
      </div>
    </section>
  );
}
