import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Eatertainment from "@/components/Eatertainment";
import LocationHours from "@/components/LocationHours";
import CtaBanner from "@/components/CtaBanner";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Founded in 2019 in Bahria Town Rawalpindi, Meseta Coffee is more than a café. It's an eatertainment lounge with specialty coffee, matcha, and the warmest welcome in town.",
};

const milestones = [
  {
    year: "2019",
    title: "Doors open at The Riviera",
    body: "A small espresso bar, four tables, a big idea: a café you don't want to leave.",
  },
  {
    year: "2021",
    title: "Kitchen expands",
    body: "House-pressed sandwiches and our now-famous walnut fudge brownie join the menu.",
  },
  {
    year: "2023",
    title: "Eatertainment is born",
    body: "Board games on every table, late-night hours, family-friendly programming.",
  },
  {
    year: "2025",
    title: "1,000+ five-star reviews",
    body: `Crossed ${site.stats.googleReviewCount}+ Google reviews at ${site.stats.googleRating}★, and growing.`,
  },
];

const values = [
  {
    title: "Quality, every single cup",
    body: "Beans from boutique roasters, dialed-in daily. If a shot isn't right, we pull it again.",
  },
  {
    title: "Hospitality that feels like home",
    body: "We learn your name, your order, your usual seat. That's the bar.",
  },
  {
    title: "A space worth lingering in",
    body: "Comfortable seating, fast Wi-Fi, late hours, and games for whenever conversation pauses.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="A coffee shop with the soul of a living room."
        description={site.longDescription}
      />

      <section className="section">
        <div className="container-base grid gap-10 sm:gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="group relative h-[340px] overflow-hidden rounded-3xl ring-1 ring-coffee-100 sm:h-[460px] lg:h-[560px]">
            <Image
              src="https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=1400&q=80"
              alt="Meseta espresso"
              fill
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
          <div>
            <p className="eyebrow">What we believe</p>
            <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl lg:text-5xl">
              Three things we will never compromise on.
            </h2>
            <ul className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
              {values.map((v, i) => (
                <li
                  key={v.title}
                  className="group flex cursor-default gap-4 transition-transform duration-300 ease-out hover:translate-x-1 sm:gap-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500/15 font-display text-lg text-gold-600 transition-all duration-500 ease-out group-hover:rotate-6 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-coffee-900 sm:h-12 sm:w-12 sm:text-xl">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900 sm:text-xl">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-coffee-600">{v.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-cream-100/40">
        <div className="container-base">
          <p className="eyebrow">Timeline</p>
          <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl lg:text-5xl">
            Six years, one obsession.
          </h2>
          <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {milestones.map((m) => (
              <div
                key={m.year}
                className="card-interactive group p-6 sm:p-7"
              >
                <span className="font-display text-3xl text-gold-600 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:text-gold-500">
                  {m.year}
                </span>
                <h3 className="mt-3 font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900 sm:text-xl">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm text-coffee-500">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Eatertainment />
      <LocationHours />
      <CtaBanner />
    </>
  );
}
