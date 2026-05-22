import { cn } from "@/lib/utils";

/**
 * Brand coffee-cup loader.
 *
 * A porcelain mug whose coffee level rises and falls, three steam wisps
 * curling off the top, and a gold "brewing" ring sweeping around it —
 * the universal spinner cue fused with the Meseta cup.
 *
 * Pure SVG + CSS keyframes (no JS, no hooks) so it works as a server
 * component and renders instantly inside route `loading.tsx` files.
 *
 * Sizes: `sm` inline, `md` default, `lg` full-page.
 */

const DIMENSIONS = { sm: 40, md: 80, lg: 120 } as const;
type Size = keyof typeof DIMENSIONS;

// Three steam wisps — gentle S-curves rising off the cup rim.
const STEAM = [
  "M42 35 C 38 30, 46 25, 42 20 C 38 15, 46 11, 42 7",
  "M50 34 C 46 29, 54 24, 50 19 C 46 14, 54 10, 50 5",
  "M58 35 C 54 30, 62 25, 58 20 C 54 15, 62 11, 58 7",
];

const CUP_BODY = "M30 42 L70 42 L64 80 Q63 86 56 86 L44 86 Q37 86 36 80 Z";

export default function CoffeeLoader({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const px = DIMENSIONS[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        <style>{KEYFRAMES}</style>
        <defs>
          <clipPath id="cl-cup-interior">
            <path d="M34 45 L66 45 L61 80 Q60 84 55 84 L45 84 Q40 84 39 80 Z" />
          </clipPath>
        </defs>

        {/* Sweeping "brewing" ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#d4a857"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="70 210"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: "cl-spin 1.1s linear infinite",
          }}
        />

        {/* The cup — gentle bob */}
        <g style={{ animation: "cl-bob 2.4s ease-in-out infinite" }}>
          {/* Steam */}
          <g
            stroke="#c9a98c"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          >
            {STEAM.map((d, i) => (
              <path
                key={i}
                d={d}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: `cl-steam 2.6s ease-in-out ${i * 0.55}s infinite`,
                }}
              />
            ))}
          </g>

          {/* Handle (behind the body) */}
          <path
            d="M69 50 C 86 50, 86 71, 66 72"
            fill="none"
            stroke="#2e1b10"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Porcelain body */}
          <path d={CUP_BODY} fill="#fbf7f1" />

          {/* Coffee — rises and falls inside the cup */}
          <g clipPath="url(#cl-cup-interior)">
            <g style={{ animation: "cl-fill 2s ease-in-out infinite" }}>
              <rect x="30" y="44" width="40" height="48" fill="#5a3a26" />
              <ellipse cx="50" cy="44" rx="17" ry="3.4" fill="#a87b58" />
            </g>
          </g>

          {/* Cup outline + rim */}
          <path
            d={CUP_BODY}
            fill="none"
            stroke="#2e1b10"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse
            cx="50"
            cy="42"
            rx="20"
            ry="4.8"
            fill="none"
            stroke="#2e1b10"
            strokeWidth="3.4"
          />
        </g>
      </svg>

      <span className="sr-only">Loading</span>
    </div>
  );
}

const KEYFRAMES = `
@keyframes cl-spin { to { transform: rotate(360deg); } }
@keyframes cl-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2.5px); }
}
@keyframes cl-fill {
  0%, 100% { transform: translateY(42px); }
  50%      { transform: translateY(2px); }
}
@keyframes cl-steam {
  0%   { opacity: 0; transform: translateY(5px); }
  30%  { opacity: 0.7; }
  65%  { opacity: 0.4; }
  100% { opacity: 0; transform: translateY(-10px); }
}
`;
