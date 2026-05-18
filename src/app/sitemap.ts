import type { MetadataRoute } from "next";
import { menu } from "@/lib/data/menu";

const staticRoutes = [
  "",
  "/menu",
  "/about",
  "/gallery",
  "/reviews",
  "/contact",
  "/reservations",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));

  const itemEntries: MetadataRoute.Sitemap = menu.map((m) => ({
    url: `${base}/menu/${m.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...itemEntries];
}
