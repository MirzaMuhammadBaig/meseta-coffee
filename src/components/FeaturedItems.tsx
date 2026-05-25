import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import Reveal from "@/components/anim/Reveal";
import { bestsellers, FALLBACK_MENU_IMAGE } from "@/lib/data/menu";
import { formatPkr } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function FeaturedItems() {
  return (
    <section className="section bg-cream-100/40">
      <div className="container-base">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-6">
          <Reveal className="max-w-xl">
            <p className="eyebrow">Most ordered</p>
            <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:mt-4 sm:text-4xl lg:text-5xl">
              Guest favourites this week
            </h2>
            <p className="mt-3 text-coffee-600 sm:mt-4">
              Pulled from a year of order data and Google reviews. These are the
              ones our regulars keep coming back for.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-coffee-700 transition-colors duration-200 hover:text-coffee-900"
            >
              <span className="link-underline">Full menu</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {bestsellers.slice(0, 6).map((item, idx) => (
            <Reveal
              key={item.slug}
              delay={idx * 90}
              variant="scale"
              as="article"
              className="card-interactive group overflow-hidden"
            >
              <Link
                href={`/menu/${item.slug}`}
                aria-label={`View ${item.name}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
              >
                <div className="relative h-48 w-full overflow-hidden bg-coffee-100 sm:h-56">
                  <SafeImage
                    src={item.image ?? FALLBACK_MENU_IMAGE}
                    fallbackSrc={FALLBACK_MENU_IMAGE}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    fallbackContent={
                      <div className="flex h-full w-full items-center justify-center bg-coffee-100 font-display text-3xl text-coffee-300">
                        {item.name.charAt(0)}
                      </div>
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {item.signature && (
                    <span className="absolute left-4 top-4 rounded-full bg-gold-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-900 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
                      Signature
                    </span>
                  )}
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900 sm:text-2xl">
                      {item.name}
                    </h3>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-coffee-700 transition-colors duration-300 group-hover:text-gold-600 sm:text-base">
                      {formatPkr(item.price)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-coffee-500">
                    {item.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
