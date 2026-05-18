const items = [
  "Specialty Coffee",
  "Turkish Matcha",
  "House-Pressed Sandwiches",
  "Cold Brew on Tap",
  "Family-Friendly",
  "Open 'til Late",
  "Free Wi-Fi",
  "Board Games on Every Table",
];

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-coffee-100 bg-cream-100/60 py-5">
      <div className="flex w-max animate-marquee gap-12">
        {[...items, ...items].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-12 font-display text-lg italic text-coffee-700"
          >
            <span>{t}</span>
            <span className="text-gold-500">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
