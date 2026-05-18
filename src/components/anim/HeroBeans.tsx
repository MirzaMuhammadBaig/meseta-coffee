"use client";

import { cn } from "@/lib/utils";

/** Single coffee bean SVG — a soft elongated oval with a center crease. */
function Bean({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <ellipse cx="20" cy="28" rx="13" ry="24" fill="currentColor" opacity={0.85} />
      <ellipse
        cx="20" cy="28" rx="13" ry="24"
        stroke="rgba(0,0,0,0.25)" strokeWidth="1" fill="none"
      />
      <path
        d="M20 6 Q23 28 20 50"
        stroke="rgba(0,0,0,0.5)" strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Decorative floating coffee beans in the hero background.
 *
 * Each bean is a stack of FOUR wrappers so the animations don't fight:
 *   1. outer span — absolute position only (left/top)
 *   2. drift span — horizontal sway (animate-bean-drift)
 *   3. float span — vertical bob (animate-bean-float)
 *   4. rotation span — static tilt (transform: rotate)
 *   5. spin span   — slow continuous rotation (animate-bean-spin) on top
 *
 * Independent durations + delays per bean = the whole field of beans
 * feels alive (drifting, bobbing, spinning) without ever marching in step.
 */
const beans: {
  pos: string;
  rotate: number;
  floatDuration: number;
  floatDelay: number;
  spinDuration: number;
  driftDuration: number;
  driftDelay: number;
  size: number;
  opacity: number;
}[] = [
  { pos: "left-[6%] top-[18%]",      rotate: -22, floatDuration: 5,   floatDelay: 0,   spinDuration: 14, driftDuration: 9,   driftDelay: 0,   size: 56, opacity: 0.28 },
  { pos: "left-[14%] top-[68%]",     rotate: 18,  floatDuration: 6,   floatDelay: 1.2, spinDuration: 18, driftDuration: 10,  driftDelay: 1.5, size: 42, opacity: 0.24 },
  { pos: "right-[8%] top-[14%]",     rotate: 35,  floatDuration: 5.5, floatDelay: 0.8, spinDuration: 12, driftDuration: 11,  driftDelay: 2,   size: 64, opacity: 0.26 },
  { pos: "right-[18%] top-[72%]",    rotate: -12, floatDuration: 7,   floatDelay: 2,   spinDuration: 20, driftDuration: 8,   driftDelay: 0.7, size: 38, opacity: 0.22 },
  { pos: "left-[42%] top-[8%]",      rotate: -45, floatDuration: 6.5, floatDelay: 0.6, spinDuration: 16, driftDuration: 12,  driftDelay: 3,   size: 32, opacity: 0.20 },
  { pos: "right-[36%] bottom-[14%]", rotate: 24,  floatDuration: 5.5, floatDelay: 1.8, spinDuration: 13, driftDuration: 9.5, driftDelay: 1.1, size: 48, opacity: 0.23 },
  { pos: "left-[58%] top-[34%]",     rotate: -8,  floatDuration: 7,   floatDelay: 2.4, spinDuration: 22, driftDuration: 11,  driftDelay: 2.3, size: 28, opacity: 0.18 },
];

export default function HeroBeans() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden text-gold-400 motion-reduce:hidden"
    >
      {beans.map((b, i) => (
        <span
          key={i}
          className={cn("absolute block", b.pos)}
          style={{
            width: b.size,
            height: b.size * 1.4,
            opacity: b.opacity,
          }}
        >
          {/* Horizontal drift */}
          <span
            className="block h-full w-full animate-bean-drift"
            style={{
              animationDuration: `${b.driftDuration}s`,
              animationDelay: `${b.driftDelay}s`,
            }}
          >
            {/* Vertical bob */}
            <span
              className="block h-full w-full animate-bean-float"
              style={{
                animationDuration: `${b.floatDuration}s`,
                animationDelay: `${b.floatDelay}s`,
              }}
            >
              {/* Static tilt (so we can rotate without overriding the float keyframe) */}
              <span
                className="block h-full w-full"
                style={{ transform: `rotate(${b.rotate}deg)` }}
              >
                {/* Continuous slow spin */}
                <span
                  className="block h-full w-full animate-bean-spin"
                  style={{ animationDuration: `${b.spinDuration}s` }}
                >
                  <Bean className="h-full w-full" />
                </span>
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
