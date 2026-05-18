import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/data/site";
import Reveal from "@/components/anim/Reveal";
import CountUp from "@/components/anim/CountUp";
import Parallax from "@/components/anim/Parallax";

export default function Story() {
  return (
    <section className="section">
      <div className="container-base grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left" duration={900}>
          <div className="group relative h-[340px] overflow-hidden rounded-3xl ring-1 ring-coffee-100 sm:h-[440px] lg:h-[520px]">
            <Parallax speed={0.12} className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80"
                alt="Inside Meseta Coffee"
                fill
                className="scale-110 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.15]"
              />
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute bottom-5 left-5 flex flex-col rounded-2xl bg-cream-50/95 p-4 shadow-xl transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-2xl sm:bottom-6 sm:left-6 sm:p-5">
              <span className="text-3xl font-display text-coffee-700 transition-colors duration-300 group-hover:text-gold-600 sm:text-4xl">
                <CountUp end={site.stats.yearsServing} suffix="+" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-coffee-400 sm:text-xs">
                Years serving Bahria
              </span>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Our story</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:mt-4 sm:text-4xl lg:text-5xl">
              Built for the way <em className="text-gold-600">you</em> hang out.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 text-base leading-relaxed text-coffee-600 sm:mt-6 sm:text-lg">
              {site.longDescription}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-coffee-100 pt-6 sm:mt-10 sm:gap-6 sm:pt-8">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-coffee-400 sm:text-xs">
                  Google rating
                </dt>
                <dd className="mt-1 font-display text-xl text-coffee-800 sm:text-3xl">
                  <CountUp end={site.stats.googleRating} decimals={1} suffix="★" />
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-coffee-400 sm:text-xs">
                  Guest reviews
                </dt>
                <dd className="mt-1 font-display text-xl text-coffee-800 sm:text-3xl">
                  <CountUp end={site.stats.googleReviewCount} suffix="+" />
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-coffee-400 sm:text-xs">
                  Instagram fam
                </dt>
                <dd className="mt-1 font-display text-xl text-coffee-800 sm:text-3xl">
                  {site.stats.instagramFollowers}
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
              <Link href="/about" className="btn-primary w-full sm:w-auto">
                Read our story
              </Link>
              <Link href="/menu" className="btn-ghost w-full sm:w-auto">
                Browse the menu
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
