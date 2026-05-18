"use client";

/**
 * Decorative steam wisps for the hero.
 *
 * Three SVG paths drawn as soft S-curves, stacked at the bottom-right of the
 * hero. Each wisp rises with the `steam-rise` keyframe (in tailwind.config),
 * fading out as it ascends. Independent delays + durations keep the motion
 * organic instead of marching in step. Hidden under prefers-reduced-motion.
 */
function Wisp({
  x,
  delay,
  duration,
  width = 18,
  opacity = 0.4,
}: {
  x: number;
  delay: number;
  duration: number;
  width?: number;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 20 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="absolute bottom-0 animate-steam-rise"
      style={{
        left: `${x}%`,
        width,
        height: width * 6.5,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity,
      }}
    >
      <path
        d="M10 120 C 4 100, 16 84, 10 64 S 4 36, 12 18 S 6 4, 10 0"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const wisps = [
  { x: 14, delay: 0,   duration: 7.5, width: 18, opacity: 0.45 },
  { x: 18, delay: 1.4, duration: 9,   width: 14, opacity: 0.35 },
  { x: 22, delay: 2.8, duration: 8,   width: 20, opacity: 0.42 },
  { x: 78, delay: 1,   duration: 8.5, width: 16, opacity: 0.40 },
  { x: 82, delay: 3.2, duration: 10,  width: 18, opacity: 0.32 },
];

export default function HeroSteam() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      {wisps.map((w, i) => (
        <Wisp key={i} {...w} />
      ))}
    </div>
  );
}
