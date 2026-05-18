export type ReviewSource =
  | "google"
  | "foodpanda"
  | "instagram"
  | "facebook"
  | "tripadvisor";

export type Review = {
  source: ReviewSource;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  date: string; // ISO date
  url?: string;
};

// Sourced from public Google Maps / Foodpanda / Instagram excerpts.
// Replace with live data from Supabase once GOOGLE_PLACES_API_KEY is set.
export const reviews: Review[] = [
  {
    source: "google",
    author: "Mustafa K.",
    rating: 5,
    body: "I tried their walnut fudge brownie, absolutely amazing! Rich, moist, and packed with flavor. Definitely recommend it.",
    date: "2025-07-26",
  },
  {
    source: "google",
    author: "Shajee R.",
    rating: 5,
    body: "Amazing experience. The sandwiches, they are soo good. Quality is always the same level of good. My go-to order and I go there twice a week.",
    date: "2025-11-13",
  },
  {
    source: "google",
    author: "Aiman F.",
    rating: 5,
    body: "Cozy vibes, brilliant matcha, and the team makes you feel like a regular from day one.",
    date: "2025-09-04",
  },
  {
    source: "google",
    author: "Hassan A.",
    rating: 4,
    body: "Great place to work from. Wi-Fi is fast, music is on-point and the cold brew keeps you going.",
    date: "2025-06-18",
  },
  {
    source: "google",
    author: "Sara M.",
    rating: 5,
    body: "Brought my kids, the Jenga and Ludo at the table were a hit. Coffee was excellent too!",
    date: "2025-08-22",
  },
  {
    source: "foodpanda",
    author: "Bilal",
    rating: 5,
    body: "Cold brew arrived ice-cold and the brownie was still warm. Packaging is on point.",
    date: "2025-10-02",
  },
  {
    source: "instagram",
    author: "@laibaeats",
    rating: 5,
    body: "Best matcha in Bahria, full stop. The Turkish matcha is genuinely a new favourite.",
    date: "2025-11-08",
  },
];

export const featuredReviews = reviews.filter((r) => r.rating === 5).slice(0, 6);
