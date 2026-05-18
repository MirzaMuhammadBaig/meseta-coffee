import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import InstagramTease from "@/components/InstagramTease";
import SafeImage from "@/components/SafeImage";
import { gallery } from "@/lib/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look inside Meseta Coffee: the space, the food, the people.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="A peek inside Meseta."
        description="Drinks, dishes, design, all shot in-house. Want to see more? Follow @meseta_pakistan."
      />

      <section className="section">
        <div className="container-base">
          <div className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[240px] sm:gap-4 md:grid-cols-3 lg:auto-rows-[280px]">
            {gallery.map((g, i) => (
              <figure
                key={i}
                className={
                  (i % 5 === 0
                    ? "row-span-2 "
                    : "") +
                  "group relative overflow-hidden rounded-3xl bg-coffee-100 ring-1 ring-coffee-100 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(66,41,26,0.45)] hover:ring-coffee-200 active:scale-[0.99]"
                }
              >
                <SafeImage
                  src={g.url}
                  alt={g.alt}
                  fill
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/70 via-coffee-900/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {g.caption && (
                  <figcaption className="absolute bottom-3 left-3 translate-y-1 rounded-full bg-coffee-900/60 px-3 py-1 text-xs text-cream-50 opacity-90 backdrop-blur transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    {g.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <InstagramTease />
    </>
  );
}
