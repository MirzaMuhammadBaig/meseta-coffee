import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { site } from "@/lib/data/site";
import CleanPreviewUrl from "@/components/CleanPreviewUrl";
import ClickEffect from "@/components/ClickEffect";
import PurgeServiceWorker from "@/components/PurgeServiceWorker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.shortDescription,
  keywords: [
    "Meseta Coffee",
    "Bahria Town coffee",
    "Rawalpindi café",
    "specialty coffee Pakistan",
    "matcha Rawalpindi",
    "Riviera Bahria",
  ],
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.shortDescription,
    type: "website",
    locale: "en_PK",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.tagline}`,
    description: site.shortDescription,
  },
};

/**
 * Minimal root: only the html/body shell + fonts + global metadata.
 * Public chrome (navbar, footer, cart) is owned by app/(site)/layout.tsx.
 * Admin chrome (sidebar, top bar) is owned by app/admin/layout.tsx.
 * This split guarantees admin pages physically cannot inherit the
 * public footer (no more headers/conditional shenanigans).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-cream-50 font-sans text-coffee-800 antialiased">
        <PurgeServiceWorker />
        <CleanPreviewUrl />
        <ClickEffect />
        {children}
      </body>
    </html>
  );
}
