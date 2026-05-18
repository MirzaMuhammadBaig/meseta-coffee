import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { site } from "@/lib/data/site";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import HeroBeans from "@/components/anim/HeroBeans";
import HeroSteam from "@/components/anim/HeroSteam";
import HeroCup from "@/components/anim/HeroCup";
import NowServing from "@/components/NowServing";

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
          <Reveal delay={0} duration={700}>
            <NowServing />
          </Reveal>

          <Reveal as="h1" duration={900} delay={100}>
            <span className="mt-5 block font-display text-[2.5rem] leading-[1.05] text-cream-50 sm:mt-6 sm:text-6xl lg:text-7xl">
              Eatertainment,
              <br />
              <span className="italic text-gold-400">brewed daily.</span>
            </span>
          </Reveal>

          <Reveal delay={250}>
            <p className="mt-5 max-w-xl text-base text-cream-100/85 sm:mt-6 sm:text-lg lg:text-xl">
              Specialty coffee, Turkish matcha, hand-pressed sandwiches and a
              board-game on every table. Rated{" "}
              <span className="font-semibold text-cream-50">
                {site.stats.googleRating}★
              </span>{" "}
              by {site.stats.googleReviewCount.toLocaleString()}+ guests on Google.
            </p>
          </Reveal>

          <Reveal delay={400}>
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

          <Reveal delay={550}>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cream-100/80 sm:mt-10 sm:gap-x-6">
              <div className="group/stars flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    style={{ transitionDelay: `${i * 60}ms` }}
                    className="h-4 w-4 fill-gold-400 text-gold-400 transition-transform duration-300 ease-out group-hover/stars:-translate-y-0.5 group-hover/stars:scale-110"
                  />
                ))}
              </div>
              <span className="whitespace-nowrap">
                {site.stats.googleRating} ·{" "}
                {site.stats.googleReviewCount.toLocaleString()} Google reviews
              </span>
            </div>
          </Reveal>
        </div>

        {/* Animated coffee cup — large beside text on desktop, below on mobile */}
        <Reveal variant="scale" duration={1100} delay={400} className="mx-auto flex justify-center lg:justify-end">
          <HeroCup />
        </Reveal>
      </div>
    </section>
  );
}
