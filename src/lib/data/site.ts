export const site = {
  name: "Meseta Coffee",
  tagline: "Eatertainment, brewed daily.",
  shortDescription:
    "Bahria Town's home for specialty coffee, Turkish matcha, hand-pressed sandwiches and the warmest café vibes in Rawalpindi.",
  longDescription:
    "Meseta Coffee was born in 2019 with a simple promise: every cup, every sandwich, every brownie tastes the same level of good every time you visit. We roast for balance, plate for joy, and design our space so you can spend an hour, or an afternoon, without feeling rushed. Board games on every table, fast Wi-Fi, and a barista who already remembers your order.",
  address: {
    line1: "The Riviera, Bahria Town Phase 4",
    line2: "Rawalpindi, Punjab",
    country: "Pakistan",
    mapsUrl: "https://maps.google.com/?q=Meseta+Coffee+Bahria+Town+Rawalpindi",
    embedUrl:
      "https://www.google.com/maps?q=Meseta+Coffee+Bahria+Town+Rawalpindi&output=embed",
  },
  hours: [
    { day: "Monday", open: "9:00 AM", close: "1:00 AM" },
    { day: "Tuesday", open: "9:00 AM", close: "1:00 AM" },
    { day: "Wednesday", open: "9:00 AM", close: "1:00 AM" },
    { day: "Thursday", open: "9:00 AM", close: "1:00 AM" },
    { day: "Friday", open: "9:00 AM", close: "2:00 AM" },
    { day: "Saturday", open: "9:00 AM", close: "2:00 AM" },
    { day: "Sunday", open: "9:00 AM", close: "1:00 AM" },
  ],
  contact: {
    phone: "+92 300 0000000",
    whatsapp: "+92 300 0000000",
    email: "hello@mesetacoffee.com",
  },
  social: {
    instagram: "https://www.instagram.com/meseta_pakistan",
    facebook: "https://www.facebook.com/mesetacoffee",
    tiktok: "https://www.tiktok.com/@meseta_pakistan",
    foodpanda:
      "https://www.foodpanda.pk/restaurant/meseta-coffee-bahria-town-rawalpindi",
  },
  stats: {
    googleRating: 4.5,
    googleReviewCount: 1072,
    instagramFollowers: "8K+",
    yearsServing: 6,
  },
} as const;

export type Site = typeof site;
