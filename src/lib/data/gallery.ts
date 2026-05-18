export type GalleryImage = {
  url: string;
  alt: string;
  caption?: string;
};

// Stable Unsplash photo IDs commonly used in café templates.
// SafeImage falls back to a styled placeholder if any of these ever 404.
export const gallery: GalleryImage[] = [
  {
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    alt: "Spanish latte close-up",
    caption: "Pulled fresh, all day.",
  },
  {
    url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
    alt: "Cafe interior with warm light",
    caption: "Warm woods, soft light.",
  },
  {
    url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80",
    alt: "Latte art heart",
  },
  {
    url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80",
    alt: "Barista pouring espresso",
  },
  {
    url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=80",
    alt: "Iced matcha latte",
  },
  {
    url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
    alt: "Chipotle chicken sandwich plate",
  },
  {
    url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=80",
    alt: "Walnut fudge brownie close-up",
  },
  {
    url: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
    alt: "Friends sharing coffee at a table",
  },
  {
    url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
    alt: "Vanilla sweet-cream cold brew",
  },
];
