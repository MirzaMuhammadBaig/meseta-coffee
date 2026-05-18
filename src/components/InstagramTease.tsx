import { Instagram } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { site } from "@/lib/data/site";
import { gallery } from "@/lib/data/gallery";

export default function InstagramTease() {
  const tiles = gallery.slice(0, 6);

  return (
    <section className="section">
      <div className="container-base">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">From the gram</p>
            <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:mt-4 sm:text-4xl lg:text-5xl">
              @meseta_pakistan
            </h2>
            <p className="mt-3 text-coffee-600 sm:mt-4">
              {site.stats.instagramFollowers} coffee lovers and counting. Tag us
              in your shots, our favourite ones land on the wall.
            </p>
          </div>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary w-full md:w-auto"
          >
            <Instagram className="mr-2 h-4 w-4" />
            Follow us
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((g, i) => (
            <a
              key={i}
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open Meseta on Instagram"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-coffee-100 ring-1 ring-coffee-100 transition-all duration-500 ease-out hover:-translate-y-1 hover:rotate-1 hover:shadow-[0_20px_40px_-15px_rgba(66,41,26,0.45)] hover:ring-gold-400/40 active:scale-95 active:rotate-0"
            >
              <SafeImage
                src={g.url}
                alt={g.alt}
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-coffee-900/0 transition-colors duration-500 group-hover:bg-coffee-900/55">
                <Instagram
                  className="h-7 w-7 -translate-y-1 scale-75 text-cream-50 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
                  strokeWidth={1.6}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
