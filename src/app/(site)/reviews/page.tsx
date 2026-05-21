import type { Metadata } from "next";
import { Star, Quote } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CtaBanner from "@/components/CtaBanner";
import ReviewForm from "@/components/ReviewForm";
import { reviews } from "@/lib/data/reviews";
import { site } from "@/lib/data/site";
import { formatDate } from "@/lib/utils";

const sourceLabel: Record<string, string> = {
  google: "Verified guest",
  foodpanda: "foodpanda",
  instagram: "Instagram",
  facebook: "Facebook",
  tripadvisor: "Tripadvisor",
};

export const metadata: Metadata = {
  title: "Reviews",
  description: `${site.stats.googleRating}★ from ${site.stats.googleReviewCount}+ verified guest reviews. See what people really think of Meseta Coffee.`,
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="What guests say"
        title={`${site.stats.googleRating}★ from ${site.stats.googleReviewCount.toLocaleString()}+ reviews.`}
        description="Verified guest reviews from across the web. We display these as-is, no curating, no edits."
      />

      <section className="section">
        <div className="container-base">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <figure
                key={i}
                className="card-interactive group relative flex h-full flex-col gap-4 p-7"
              >
                <Quote className="absolute right-6 top-6 h-8 w-8 text-coffee-100 transition-all duration-500 group-hover:rotate-6 group-hover:text-gold-400/60" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star
                      key={j}
                      style={{ transitionDelay: `${j * 60}ms` }}
                      className="h-4 w-4 fill-gold-500 text-gold-500 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
                    />
                  ))}
                </div>
                <blockquote className="text-coffee-700 transition-colors duration-300 group-hover:text-coffee-900">
                  "{r.body}"
                </blockquote>
                <figcaption className="mt-auto flex items-center justify-between border-t border-coffee-100 pt-4 text-xs text-coffee-500 transition-colors duration-300 group-hover:border-coffee-200">
                  <span className="font-semibold text-coffee-700">
                    {r.author}
                  </span>
                  <span>
                    {sourceLabel[r.source]} · {formatDate(r.date)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="leave-a-review"
        className="scroll-mt-24 bg-cream-100/40 py-14 sm:py-20"
      >
        <div className="container-base grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">Have you been recently?</p>
            <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl">
              Tell us how we did.
            </h2>
            <p className="mt-4 max-w-md text-sm text-coffee-600">
              Two minutes of your time helps us get better and helps others
              find us. Genuine reviews only — our team checks each one before
              it appears on the site.
            </p>
          </div>
          <ReviewForm />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
