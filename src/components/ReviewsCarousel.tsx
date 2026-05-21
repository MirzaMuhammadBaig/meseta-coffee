import Link from "next/link";
import { Star, Quote } from "lucide-react";
import { featuredReviews } from "@/lib/data/reviews";
import { formatDate } from "@/lib/utils";
import { site } from "@/lib/data/site";
import Reveal from "@/components/anim/Reveal";

const sourceLabel: Record<string, string> = {
  google: "Verified guest",
  foodpanda: "foodpanda",
  instagram: "Instagram",
  facebook: "Facebook",
  tripadvisor: "Tripadvisor",
};

export default function ReviewsCarousel() {
  return (
    <section className="section bg-coffee-800 text-cream-50">
      <div className="container-base">
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end lg:gap-6">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-gold-400">What guests are saying</p>
            <h2 className="mt-3 font-display text-3xl text-cream-50 sm:mt-4 sm:text-4xl lg:text-5xl">
              {site.stats.googleRating}★ from{" "}
              {site.stats.googleReviewCount.toLocaleString()}+ happy guests
            </h2>
            <p className="mt-3 max-w-xl text-sm text-cream-100/70 sm:mt-4 sm:text-base">
              Real words from real customers. We don't curate or edit. These
              are public reviews exactly as our guests wrote them.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <Link href="/reviews#leave-a-review" className="btn-gold w-full sm:w-auto">
              Leave a review
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {featuredReviews.slice(0, 6).map((r, idx) => (
            <Reveal
              key={idx}
              delay={idx * 100}
              variant="scale"
              as="figure"
              className="group relative rounded-3xl bg-coffee-700/40 p-6 ring-1 ring-coffee-100/10 backdrop-blur transition-all duration-500 ease-out hover:-translate-y-1.5 hover:bg-coffee-700/60 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] hover:ring-gold-400/30 sm:p-7"
            >
              <Quote className="absolute right-5 top-5 h-7 w-7 text-gold-400/40 transition-all duration-500 group-hover:rotate-6 group-hover:text-gold-400/70 sm:right-6 sm:top-6 sm:h-8 sm:w-8" />
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star
                    key={i}
                    style={{ transitionDelay: `${i * 60}ms` }}
                    className="h-4 w-4 fill-gold-400 text-gold-400 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-cream-100/90 transition-colors duration-300 group-hover:text-cream-50 sm:text-base">
                "{r.body}"
              </blockquote>
              <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-cream-100/10 pt-4 text-xs text-cream-100/60 transition-colors duration-300 group-hover:border-gold-400/30 sm:mt-6">
                <span className="font-semibold text-cream-50">{r.author}</span>
                <span>
                  {sourceLabel[r.source]} · {formatDate(r.date)}
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
