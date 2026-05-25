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
  {
    source: "google",
    author: "Ahmad H.",
    rating: 5,
    body: "Spanish latte here is unmatched in Pindi. Spent three hours on a deadline and the team kept the cold brew refills coming.",
    date: "2026-01-12",
  },
  {
    source: "google",
    author: "Nimra S.",
    rating: 5,
    body: "Layered latte became my Sunday ritual. The chipotle sandwich is huge for the price too.",
    date: "2025-12-30",
  },
  {
    source: "google",
    author: "Talha I.",
    rating: 4,
    body: "Service is friendly and the brew is consistent. Could use a few more power outlets near the window seats.",
    date: "2026-02-04",
  },
  {
    source: "foodpanda",
    author: "Rabia K.",
    rating: 5,
    body: "Iced jasmine arrived properly cold and the brownie was fresh. Wish they would offer larger sizes for the cold brew.",
    date: "2026-03-15",
  },
  {
    source: "google",
    author: "Osama Q.",
    rating: 5,
    body: "Truffle mushroom melt is dangerous, I order it every visit now. Coffee is consistently excellent.",
    date: "2025-12-08",
  },
  {
    source: "google",
    author: "Iman B.",
    rating: 5,
    body: "Best place to take my mom out for a quiet brunch. The team noticed she preferred decaf and remembered the next time.",
    date: "2026-04-22",
  },
  {
    source: "instagram",
    author: "@zaina.r",
    rating: 5,
    body: "Strawberry matcha is the move. Aesthetic is on point too, perfect content backdrop.",
    date: "2026-02-18",
  },
  {
    source: "google",
    author: "Ahmer F.",
    rating: 5,
    body: "Came with friends for board games and ended up staying till close. The team is so warm, never made us feel rushed.",
    date: "2025-10-29",
  },
  {
    source: "google",
    author: "Fatima Z.",
    rating: 4,
    body: "Atmosphere is wonderful. Wish the bakery counter was a touch bigger so you can see all options at once.",
    date: "2026-01-25",
  },
  {
    source: "google",
    author: "Sami M.",
    rating: 5,
    body: "Caramel macchiato is rich without being overly sweet. The almond croissant pairs beautifully.",
    date: "2026-03-02",
  },
  {
    source: "foodpanda",
    author: "Komal A.",
    rating: 5,
    body: "Order arrived on time and the rider was sweet. Cold brew kept its temperature even after 25 minutes.",
    date: "2025-11-19",
  },
  {
    source: "google",
    author: "Bilal K.",
    rating: 5,
    body: "Hosted a small birthday for 8 people. They set us up a corner, brought the cake at the right moment, and did not charge for the candle service.",
    date: "2026-04-08",
  },
  {
    source: "instagram",
    author: "@anaya.eats",
    rating: 5,
    body: "The aesthetic, the soft music, the perfectly pulled flat white. Meseta gets every detail right.",
    date: "2025-12-17",
  },
  {
    source: "google",
    author: "Usman T.",
    rating: 5,
    body: "Came on a date and the staff quietly arranged my dessert with a sweet message on the plate. Made the night perfect.",
    date: "2025-09-14",
  },
  {
    source: "google",
    author: "Mariam L.",
    rating: 4,
    body: "Vanilla sweet cream cold brew is sublime. Lost a star because the bathroom was a bit small for the crowd that day.",
    date: "2026-02-09",
  },
  {
    source: "facebook",
    author: "Rehan J.",
    rating: 5,
    body: "Took my colleagues here for a team off-site. Excellent space for 6 people, great Wi-Fi, and the menu had something for everyone.",
    date: "2025-10-05",
  },
  {
    source: "google",
    author: "Sana E.",
    rating: 5,
    body: "Tried the tiramisu after dinner and it might be the best in Bahria. The barista even let me sample the new seasonal latte for free.",
    date: "2026-03-29",
  },
  {
    source: "google",
    author: "Awais R.",
    rating: 5,
    body: "Consistency is everything in coffee, and Meseta nails it. Every visit, the espresso pulls exactly the same.",
    date: "2025-12-22",
  },
  {
    source: "tripadvisor",
    author: "Hira N.",
    rating: 5,
    body: "Visited from Lahore on a road trip. So glad we stopped. The matcha latte was the highlight of our weekend.",
    date: "2026-01-18",
  },
  {
    source: "google",
    author: "Yusuf P.",
    rating: 5,
    body: "Pesto turkey press and a flat white is my new lunch order. The kitchen is fast even at peak hours.",
    date: "2025-11-26",
  },
];

export const featuredReviews = reviews.filter((r) => r.rating === 5).slice(0, 6);
