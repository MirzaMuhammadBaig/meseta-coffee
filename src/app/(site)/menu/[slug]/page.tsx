import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Sparkles, ChefHat } from "lucide-react";
import AddToOrderButton from "@/components/cart/AddToOrderButton";
import CtaBanner from "@/components/CtaBanner";
import SafeImage from "@/components/SafeImage";
import {
  FALLBACK_MENU_IMAGE,
  getCategory,
  getPublicMenuItem,
  getRelatedItems,
  menu,
} from "@/lib/data/menu";
import { formatPkr } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return menu.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const item = await getPublicMenuItem(params.slug);
  if (!item) return { title: "Menu item" };
  return {
    title: item.name,
    description: item.description,
    openGraph: {
      title: item.name,
      description: item.description,
      images: item.image ? [{ url: item.image }] : undefined,
    },
  };
}

export default async function MenuItemPage({ params }: { params: Params }) {
  const item = await getPublicMenuItem(params.slug);
  if (!item) notFound();

  const category = getCategory(item.category);
  const related = getRelatedItems(item, 3);
  const image = item.image ?? FALLBACK_MENU_IMAGE;

  return (
    <>
      <section className="pb-12 pt-8 sm:pt-10 lg:pt-12">
        <div className="container-base">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.2em] text-coffee-400"
          >
            <Link
              href="/menu"
              className="link-underline transition-colors hover:text-coffee-700"
            >
              Menu
            </Link>
            <span aria-hidden>·</span>
            {category && (
              <>
                <Link
                  href={`/menu#${category.slug}`}
                  className="link-underline transition-colors hover:text-coffee-700"
                >
                  {category.name}
                </Link>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="text-coffee-700">{item.name}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            {/* Image */}
            <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-coffee-100 ring-1 ring-coffee-100 sm:aspect-[5/4] lg:aspect-square">
              <SafeImage
                src={image}
                alt={item.name}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                fallbackSrc={FALLBACK_MENU_IMAGE}
              />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {item.bestseller && (
                  <span className="rounded-full bg-coffee-800/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50 backdrop-blur">
                    Bestseller
                  </span>
                )}
                {item.signature && (
                  <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-900 shadow-sm">
                    Signature
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <p className="eyebrow">{category?.name ?? "Menu item"}</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-coffee-800 sm:text-5xl lg:text-6xl">
                {item.name}
              </h1>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-3xl text-gold-600 sm:text-4xl">
                  {formatPkr(item.price)}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-coffee-400">
                  Inclusive of tax
                </span>
              </div>

              <p className="mt-6 text-base leading-relaxed text-coffee-600 sm:text-lg">
                {item.description}
              </p>

              {item.tags && item.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-cream-100 px-3 py-1 text-[11px] uppercase tracking-wider text-coffee-600"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-coffee-100 bg-cream-50 p-5 shadow-[0_18px_40px_-30px_rgba(66,41,26,0.45)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-coffee-400">
                    Add to your order
                  </p>
                  <p className="mt-1 font-display text-lg text-coffee-800">
                    Pay securely and pick up in minutes.
                  </p>
                </div>
                <AddToOrderButton
                  slug={item.slug}
                  name={item.name}
                  price={item.price}
                  className="!px-5 !py-2.5 !text-sm"
                />
              </div>

              <ul className="mt-6 grid gap-3 text-sm text-coffee-600 sm:grid-cols-3">
                <li className="flex items-start gap-2">
                  <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  Made fresh to order
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  Ready in 5 to 10 min
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  Allergens? Just ask.
                </li>
              </ul>

              <Link
                href="/menu"
                className="mt-10 inline-flex items-center gap-2 self-start text-sm font-semibold uppercase tracking-[0.2em] text-coffee-700 transition-colors duration-200 hover:text-coffee-900"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-coffee-100 bg-cream-100/40 py-14 sm:py-20">
          <div className="container-base">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">You might also like</p>
                <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl">
                  More from {category?.name ?? "the menu"}
                </h2>
              </div>
              <Link
                href="/menu"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee-700 transition-colors duration-200 hover:text-coffee-900"
              >
                Full menu →
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {related.map((r) => (
                <article
                  key={r.slug}
                  className="card-interactive group flex flex-col overflow-hidden"
                >
                  <Link
                    href={`/menu/${r.slug}`}
                    className="block focus:outline-none"
                    aria-label={`View ${r.name}`}
                  >
                    <div className="relative h-44 w-full overflow-hidden sm:h-48">
                      <SafeImage
                        src={r.image ?? FALLBACK_MENU_IMAGE}
                        alt={r.name}
                        fill
                        className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        fallbackSrc={FALLBACK_MENU_IMAGE}
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900 sm:text-xl">
                          {r.name}
                        </h3>
                        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-coffee-700 transition-colors duration-300 group-hover:text-gold-600 sm:text-base">
                          {formatPkr(r.price)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-coffee-500">
                        {r.description}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-auto flex items-center justify-end border-t border-coffee-100 p-4">
                    <AddToOrderButton
                      slug={r.slug}
                      name={r.name}
                      price={r.price}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
