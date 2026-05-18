"use client";

import { useId } from "react";

/**
 * Animated latte art that draws itself on top of a coffee surface.
 *
 * Pattern: classic vertical rosetta — heart drop at the top, thin pull-
 * through stem down the centre, lens-shaped leaves stacked along the
 * stem fanning outward, and a tail at the bottom. Just like the work
 * of a real barista pouring milk.
 *
 * Cycle (10s, infinite):
 *   • Shapes appear in sequence — heart → stem → leaves (inside out) →
 *     tail — so it reads as a barista pouring.
 *   • Stroked shapes draw via `stroke-dashoffset`.
 *   • Filled shapes scale up from 0.55 → 1 + fade in.
 *   • All shapes hold drawn until ~75%, then dissolve smoothly back to
 *     plain coffee over 75–92%, then reset.
 *
 * Reusable: add a pattern by adding an entry to `patterns`. Each entry
 * is an array of `{ d, w, kind? }` — `kind: "fill"` makes a filled
 * shape (scale-in), otherwise it's a stroke (draw-on).
 */

type Path = {
  d: string;
  w: number;
  /** "fill" = filled shape that fades+scales in. Default is "stroke". */
  kind?: "fill" | "stroke";
};

// All coordinates assume the cup's coffee surface ellipse is at
// (cx=190, cy=122) with rx=140, ry=38.
const patterns: Record<string, Path[]> = {
  // ─── Classic vertical rosetta ────────────────────────────
  rosetta: [
    // 1. Top heart (filled)
    {
      d: "M 190 85 C 173 76, 159 88, 169 102 L 190 116 L 211 102 C 221 88, 207 76, 190 85 Z",
      w: 0,
      kind: "fill",
    },
    // 2. Stem — thin pull-through line down the centre
    { d: "M 190 110 L 190 158", w: 2.5, kind: "stroke" },
    // 3. Leaf 1 — smallest, just below heart
    { d: "M 173 119 Q 190 113 207 119 Q 190 127 173 119 Z", w: 0, kind: "fill" },
    // 4. Leaf 2
    { d: "M 164 127 Q 190 120 216 127 Q 190 137 164 127 Z", w: 0, kind: "fill" },
    // 5. Leaf 3 — widest in the middle
    { d: "M 160 136 Q 190 128 220 136 Q 190 146 160 136 Z", w: 0, kind: "fill" },
    // 6. Leaf 4
    { d: "M 165 145 Q 190 138 215 145 Q 190 153 165 145 Z", w: 0, kind: "fill" },
    // 7. Leaf 5 — tapering down
    { d: "M 173 153 Q 190 148 207 153 Q 190 158 173 153 Z", w: 0, kind: "fill" },
    // 8. Tail — final pull-through tip
    { d: "M 190 156 L 190 162", w: 2, kind: "stroke" },
  ],

  // ─── Heart ────────────────────────────────────────────────
  heart: [
    {
      d: "M 190 100 C 168 84, 145 102, 158 122 L 190 152 L 222 122 C 235 102, 212 84, 190 100 Z",
      w: 0,
      kind: "fill",
    },
    { d: "M 190 92 L 190 152", w: 3, kind: "stroke" },
  ],

  // ─── Tulip ────────────────────────────────────────────────
  // Three stacked filled petals + a thin pull-through tail.
  tulip: [
    { d: "M 190 95  C 173 86, 160 100, 175 112 L 190 122 L 205 112 C 220 100, 207 86, 190 95 Z", w: 0, kind: "fill" },
    { d: "M 190 108 C 175 102, 165 114, 178 124 L 190 132 L 202 124 C 215 114, 205 102, 190 108 Z", w: 0, kind: "fill" },
    { d: "M 190 122 C 178 118, 170 128, 180 138 L 190 144 L 200 138 C 210 128, 202 118, 190 122 Z", w: 0, kind: "fill" },
    { d: "M 190 138 L 190 160", w: 2.5, kind: "stroke" },
  ],
};

export type LatteArtPattern = keyof typeof patterns;

export default function LatteArt({
  pattern = "rosetta",
}: {
  pattern?: LatteArtPattern;
}) {
  const uid = useId().replace(/:/g, "");
  const paths = patterns[pattern] ?? patterns.rosetta;

  const cycle = 10;
  const appearStart = 0.4;
  const appearDur = 0.45;

  const keyframes = paths
    .map((p, i) => {
      const start = ((appearStart + i * appearDur) / cycle) * 100;
      const end = ((appearStart + (i + 1) * appearDur) / cycle) * 100;
      const isFill = p.kind === "fill" || p.w === 0;

      // Filled shapes: scale + fade.   Stroked shapes: dashoffset + fade.
      const enterFrom = isFill
        ? "transform: scale(0.55); opacity: 0;"
        : "stroke-dashoffset: 100; opacity: 0;";
      const enterTo = isFill
        ? "transform: scale(1); opacity: 1;"
        : "stroke-dashoffset: 0; opacity: 1;";
      const holdState = isFill
        ? "transform: scale(1); opacity: 1;"
        : "stroke-dashoffset: 0; opacity: 1;";
      const dissolveState = isFill
        ? "transform: scale(1.04); opacity: 0;"
        : "stroke-dashoffset: 0; opacity: 0;";

      return `
@keyframes la-${uid}-${i} {
  0%, ${start.toFixed(2)}% { ${enterFrom} }
  ${end.toFixed(2)}%        { ${enterTo} }
  75%                       { ${holdState} }
  92%                       { ${dissolveState} }
  100%                      { ${enterFrom} }
}`;
    })
    .join("\n");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <defs>
        {/* Soft blur so the milk reads as creamy paint, not as a vector edge. */}
        <filter
          id={`latte-soft-${uid}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
      </defs>
      <g filter={`url(#latte-soft-${uid})`}>
        {paths.map((p, i) => {
          const isFill = p.kind === "fill" || p.w === 0;
          return (
            <path
              key={i}
              d={p.d}
              pathLength={isFill ? undefined : 100}
              fill={isFill ? "rgba(252,244,228,0.97)" : "none"}
              stroke={isFill ? "none" : "rgba(252,244,228,0.97)"}
              strokeWidth={p.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: isFill ? undefined : 100,
                strokeDashoffset: isFill ? undefined : 100,
                opacity: 0,
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `la-${uid}-${i} ${cycle}s ease-out infinite`,
              }}
            />
          );
        })}
      </g>
    </>
  );
}
