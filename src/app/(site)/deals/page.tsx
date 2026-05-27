import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tag, TicketPercent } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SafeImage from "@/components/SafeImage";
import CtaBanner from "@/components/CtaBanner";
import {
  bestDealForMenuItem,
  dealBadgeText,
  getActiveDeals,
} from "@/lib/data/deals-public";
import { getPublicMenu } from "@/lib/data/menu";
import { FALLBACK_MENU_IMAGE } from "@/lib/data/menu-images";
import { formatPkr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Deals",
  description:
    "Active deals and offers at Meseta Coffee. Automatic at checkout — no code needed.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const [deals, menuData] = await Promise.all([
    getActiveDeals(),
    getPublicMenu(),
  ]);
  const { items, categories } = menuData;
  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <PageHeader
        eyebrow="Save with us"
        title={
          deals.length > 0
            ? `${deals.length} live deal${deals.length === 1 ? "" : "s"} right now`
            : "No live deals right now"
        }
        description="Deals apply automatically at checkout — no code needed. Got a coupon code? Enter it in the cart drawer or on the checkout page."
      />

      <section className="section">
        <div className="container-base">
          {deals.length === 0 ? (
            <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-coffee-400">
                <Tag className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-2xl text-coffee-800">
                Check back soon.
              </h2>
              <p className="mt-2 text-sm text-coffee-500">
                We rotate deals every few weeks. In the meantime, the menu is
                always full of guest favourites.
              </p>
              <Link href="/menu" className="btn-primary mt-6">
                Browse the menu
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {deals.map((d) => {
                // For item/category deals, find one sample item so the card
                // can show a concrete before/after price.
                let sample: { slug: string; name: string; price: number; image?: string } | null = null;
                if (d.applies_to === "item" && d.target_slug) {
                  const it = items.find((i) => i.slug === d.target_slug);
                  if (it)
                    sample = {
                      slug: it.slug,
                      name: it.name,
                      price: it.price,
                      image: it.image,
                    };
                } else if (d.applies_to === "category" && d.target_slug) {
                  const it = items.find(
                    (i) => i.category === d.target_slug && (i.bestseller || true),
                  );
                  if (it)
                    sample = {
                      slug: it.slug,
                      name: it.name,
                      price: it.price,
                      image: it.image,
                    };
                }

                const computed = sample
                  ? bestDealForMenuItem(sample.slug, null, sample.price, [d])
                  : null;

                return (
                  <article
                    key={d.id}
                    className="card-interactive group overflow-hidden"
                  >
                    <div className="grid sm:grid-cols-[1fr_1.2fr]">
                      <div className="relative aspect-[4/3] bg-cream-100 sm:aspect-auto">
                        <SafeImage
                          src={d.image_url ?? sample?.image ?? FALLBACK_MENU_IMAGE}
                          fallbackSrc={FALLBACK_MENU_IMAGE}
                          alt={d.title}
                          fill
                          className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        />
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-coffee-900 shadow-md">
                          <TicketPercent className="h-3 w-3" />
                          {dealBadgeText(d)}
                        </span>
                      </div>
                      <div className="p-5 sm:p-6">
                        <p className="eyebrow">
                          {d.applies_to === "all" && "Whole menu"}
                          {d.applies_to === "category" &&
                            `Category · ${categoryName(d.target_slug ?? "")}`}
                          {d.applies_to === "item" && "Single item"}
                        </p>
                        <h3 className="mt-2 font-display text-2xl text-coffee-800 sm:text-3xl">
                          {d.title}
                        </h3>
                        {d.description && (
                          <p className="mt-3 text-sm text-coffee-600">
                            {d.description}
                          </p>
                        )}

                        {sample && computed && (
                          <div className="mt-4 rounded-2xl border border-coffee-100 bg-cream-50/60 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-400">
                              For example
                            </p>
                            <p className="mt-1 flex items-baseline justify-between gap-3">
                              <span className="text-sm font-semibold text-coffee-800">
                                {sample.name}
                              </span>
                              <span className="tabular-nums">
                                <span className="text-xs text-coffee-400 line-through">
                                  {formatPkr(sample.price)}
                                </span>{" "}
                                <span className="font-semibold text-matcha-700">
                                  {formatPkr(computed.discountedPrice)}
                                </span>
                              </span>
                            </p>
                          </div>
                        )}

                        {d.ends_at && (
                          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-coffee-400">
                            Ends{" "}
                            {new Date(d.ends_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}

                        <Link
                          href={
                            d.applies_to === "item" && d.target_slug
                              ? `/menu/${d.target_slug}`
                              : "/menu"
                          }
                          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-coffee-700 transition-colors hover:text-coffee-900"
                        >
                          <span className="link-underline">Shop this deal</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
