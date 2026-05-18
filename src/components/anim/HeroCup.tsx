"use client";

import LatteArt, { type LatteArtPattern } from "./LatteArt";

/**
 * Premium tilted (~25°) terracotta cappuccino cup for the hero — modelled
 * after the reference illustration the brand picked.
 *
 *   • Warm terracotta-orange porcelain body with a glossy left highlight
 *   • Thin dark outline so the cup reads as a clean brand-style illustration
 *   • Side handle (right) with inner shadow + outer rim line
 *   • Round white saucer underneath with concentric darker line
 *   • Wide elliptical coffee surface tilted upward (rim shadow + crema)
 *   • Animated <LatteArt /> on the coffee surface (default: rosetta)
 *   • No steam — clean focus on the latte art (the focal point)
 *   • Whole composition bobs gently + saucer counter-wobbles
 *   • Cinematic gold "shine sweep" sweeps across the cup body
 */

export default function HeroCup({
  className,
  pattern = "rosetta",
}: {
  className?: string;
  /** Latte-art pattern drawn on the coffee surface. */
  pattern?: LatteArtPattern;
}) {
  return (
    <div
      aria-hidden
      className={"pointer-events-none relative " + (className ?? "")}
    >
      {/* Warm halo behind the cup */}
      <div className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/12 blur-3xl" />

      <div className="relative animate-cup-bob motion-reduce:animate-none">
        <svg
          viewBox="0 0 380 320"
          xmlns="http://www.w3.org/2000/svg"
          className="relative aspect-[380/320] w-full max-w-[17rem] overflow-visible sm:max-w-[22rem] lg:max-w-[26rem]"
        >
          <defs>
            {/* ── Terracotta porcelain body ─────────────────── */}
            <linearGradient id="cup-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#f6a36d" />
              <stop offset="35%"  stopColor="#e8843e" />
              <stop offset="75%"  stopColor="#c75e25" />
              <stop offset="100%" stopColor="#9c4818" />
            </linearGradient>
            {/* Glossy left-side highlight */}
            <linearGradient id="cup-gloss" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"  stopColor="rgba(255,236,200,0.55)" />
              <stop offset="55%" stopColor="rgba(255,236,200,0)" />
            </linearGradient>
            {/* Coffee surface — deep brown gradient */}
            <radialGradient id="coffee-fill" cx="40%" cy="35%" r="80%">
              <stop offset="0%"   stopColor="#5a3320" />
              <stop offset="55%"  stopColor="#3a1e12" />
              <stop offset="100%" stopColor="#1a0c06" />
            </radialGradient>
            {/* Warm crema sheen at the back of the surface */}
            <radialGradient id="coffee-shine" cx="40%" cy="22%" r="55%">
              <stop offset="0%"  stopColor="rgba(255,228,176,0.30)" />
              <stop offset="80%" stopColor="rgba(255,228,176,0)" />
            </radialGradient>
            {/* Saucer porcelain — cream-white */}
            <radialGradient id="saucer-grad" cx="50%" cy="40%" r="70%">
              <stop offset="0%"   stopColor="#fbf7f1" />
              <stop offset="80%"  stopColor="#ecdfc8" />
              <stop offset="100%" stopColor="#c9aa7d" />
            </radialGradient>
            {/* Cinematic shine sweep */}
            <linearGradient id="shine-sweep" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
              <stop offset="50%"  stopColor="rgba(255,240,200,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Clip latte art to the coffee surface ellipse */}
            <clipPath id="coffee-clip">
              <ellipse cx="190" cy="122" rx="140" ry="38" />
            </clipPath>
            {/* Clip the shine sweep to the cup body */}
            <clipPath id="cup-body-clip">
              <path d="M 50 120 Q 56 220 90 258 Q 190 280 290 258 Q 324 220 330 120 A 140 38 0 0 0 50 120 Z" />
            </clipPath>
          </defs>

          {/* ── Saucer (under cup) ──────────────────────────── */}
          <g
            style={{ transformOrigin: "190px 280px" }}
            className="animate-saucer-wobble motion-reduce:animate-none"
          >
            <ellipse cx="190" cy="296" rx="174" ry="16" fill="#2a180e" opacity={0.3} />
            <ellipse cx="190" cy="280" rx="164" ry="18" fill="url(#saucer-grad)" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
            <ellipse cx="190" cy="278" rx="150" ry="14" fill="rgba(0,0,0,0.06)" />
            <ellipse cx="190" cy="277" rx="142" ry="12" fill="url(#saucer-grad)" />
          </g>

          {/* ── Handle (right side, behind cup body) ─────────── */}
          <path
            d="M 330 160 C 376 162, 376 232, 320 232"
            stroke="url(#cup-body)" strokeWidth="22" fill="none" strokeLinecap="round"
          />
          <path
            d="M 330 160 C 376 162, 376 232, 320 232"
            stroke="rgba(58,24,8,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
          {/* Handle inner shadow */}
          <path
            d="M 333 172 C 362 174, 362 220, 322 220"
            stroke="rgba(58,24,8,0.45)" strokeWidth="2" fill="none" strokeLinecap="round"
          />

          {/* ── Cup body ─────────────────────────────────────── */}
          <path
            d="M 50 120 Q 56 220 90 258 Q 190 280 290 258 Q 324 220 330 120 A 140 38 0 0 0 50 120 Z"
            fill="url(#cup-body)"
            stroke="rgba(58,24,8,0.85)"
            strokeWidth="1.8"
          />
          {/* Glossy left highlight */}
          <path
            d="M 50 120 Q 56 220 90 258 Q 110 270 130 273 L 130 130 Q 90 130 60 120 Z"
            fill="url(#cup-gloss)"
            opacity={0.95}
          />
          {/* Specular highlight curve down the left edge */}
          <path
            d="M 90 138 Q 76 200 100 250"
            stroke="rgba(255,236,200,0.55)" strokeWidth="4" fill="none" strokeLinecap="round"
          />

          {/* Cinematic shine sweep */}
          <g clipPath="url(#cup-body-clip)">
            <rect
              x="-140" y="100" width="100" height="220"
              fill="url(#shine-sweep)"
              className="animate-cup-shine motion-reduce:hidden"
            />
          </g>

          {/* ── Coffee surface ───────────────────────────────── */}
          {/* Inner rim shadow (dark line where the porcelain folds inward) */}
          <ellipse cx="190" cy="120" rx="144" ry="40" fill="#3a1c0e" />
          {/* The coffee */}
          <ellipse cx="190" cy="122" rx="140" ry="38" fill="url(#coffee-fill)" />
          {/* Crema sheen */}
          <ellipse cx="190" cy="122" rx="140" ry="38" fill="url(#coffee-shine)" />

          {/* Crema bubbles for depth */}
          <g opacity={0.45}>
            <circle cx="120" cy="118" r="1.6" fill="rgba(255,232,196,0.7)" />
            <circle cx="232" cy="115" r="1.2" fill="rgba(255,232,196,0.5)" />
            <circle cx="252" cy="132" r="1"   fill="rgba(255,232,196,0.4)" />
          </g>

          {/* ── Latte art — clipped to coffee surface ──────── */}
          <g clipPath="url(#coffee-clip)">
            <LatteArt pattern={pattern} />
          </g>
        </svg>
      </div>
    </div>
  );
}
