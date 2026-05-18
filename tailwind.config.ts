import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fbf7f1",
          100: "#f5ecdf",
          200: "#ead7bd",
          300: "#dcbd95",
        },
        coffee: {
          50: "#f6f1ec",
          100: "#e7d8c8",
          200: "#c9a98c",
          300: "#a87b58",
          400: "#7a5236",
          500: "#5a3a26",
          600: "#42291a",
          700: "#2e1b10",
          800: "#1f120a",
          900: "#150c06",
        },
        gold: {
          400: "#d4a857",
          500: "#b88a3a",
          600: "#8f6826",
        },
        matcha: {
          400: "#8aa066",
          500: "#5f7a3b",
          600: "#46582a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      backgroundImage: {
        "hero-grain":
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,168,87,0.08), transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "marquee": "marquee 30s linear infinite",
        "cart-pulse": "cartPulse 0.45s ease-out",
        // Hero decorations
        "bean-float": "beanFloat 6s ease-in-out infinite",
        "bean-spin": "beanSpin 14s linear infinite",
        "bean-drift": "beanDrift 9s ease-in-out infinite",
        "steam-rise": "steamRise 6s ease-in-out infinite",
        // Natural coffee-cup steam: rises + sways + disperses
        "steam-sway-a": "steamSwayA 5s ease-in-out infinite",
        "steam-sway-b": "steamSwayB 6s ease-in-out infinite",
        "steam-sway-c": "steamSwayC 5.5s ease-in-out infinite",
        "scroll-dot": "scrollDot 2s ease-in-out infinite",
        "bounce-slow": "bounceSlow 2.4s ease-in-out infinite",
        "cup-bob": "cupBob 4s ease-in-out infinite",
        "coffee-ripple": "coffeeRipple 3.6s ease-in-out infinite",
        "bean-orbit": "beanOrbit 9s linear infinite",
        "saucer-wobble": "saucerWobble 4s ease-in-out infinite",
        "cup-shine": "cupShine 5.5s ease-in-out infinite",
        // Section reveals (CSS-only fallbacks for non-Reveal places)
        "fade-up-soft": "fadeUpSoft 0.9s ease-out forwards",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        cartPulse: {
          "0%":   { transform: "translateY(0) scale(1)" },
          "40%":  { transform: "translateY(-6px) scale(1.06)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        // Bean drift — translateY bob, large enough to be clearly visible.
        beanFloat: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%":      { transform: "translate3d(0,-36px,0)" },
        },
        // Slow continuous rotation, layered on top of the drift.
        beanSpin: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Subtle horizontal drift so beans don't move in a perfect vertical line.
        beanDrift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "33%":      { transform: "translate3d(14px,0,0)" },
          "66%":      { transform: "translate3d(-10px,0,0)" },
        },
        // Steam wisp — rises, drifts left, fades out.
        steamRise: {
          "0%":   { transform: "translate3d(0,0,0) scaleX(1)",            opacity: "0" },
          "15%":  { opacity: "0.9" },
          "100%": { transform: "translate3d(-12px,-180px,0) scaleX(0.5)", opacity: "0" },
        },
        // Realistic coffee vapor — rises slowly, drifts gently side-to-side,
        // disperses (grows) and fades at the top. Three variants give each
        // wisp a different "personality" so the cloud feels organic.
        // Longer visible phase + smoother easing = more calming.
        steamSwayA: {
          "0%":   { transform: "translate(0,0) scale(0.55)",         opacity: "0"   },
          "10%":  { opacity: "0.4" },
          "25%":  { transform: "translate(4px,-30px) scale(0.9)",    opacity: "0.85" },
          "45%":  { transform: "translate(-5px,-75px) scale(1.05)",  opacity: "0.75" },
          "65%":  { transform: "translate(8px,-130px) scale(1.25)",  opacity: "0.55" },
          "85%":  { transform: "translate(-3px,-185px) scale(1.55)", opacity: "0.2" },
          "100%": { transform: "translate(2px,-230px) scale(1.85)",  opacity: "0"   },
        },
        steamSwayB: {
          "0%":   { transform: "translate(0,0) scale(0.55)",          opacity: "0"   },
          "10%":  { opacity: "0.35" },
          "25%":  { transform: "translate(-4px,-32px) scale(0.9)",    opacity: "0.8" },
          "45%":  { transform: "translate(6px,-75px) scale(1.05)",    opacity: "0.7" },
          "65%":  { transform: "translate(-9px,-130px) scale(1.25)",  opacity: "0.5" },
          "85%":  { transform: "translate(4px,-185px) scale(1.55)",   opacity: "0.18" },
          "100%": { transform: "translate(-2px,-232px) scale(1.85)",  opacity: "0"   },
        },
        steamSwayC: {
          "0%":   { transform: "translate(0,0) scale(0.6)",           opacity: "0"   },
          "12%":  { opacity: "0.3" },
          "30%":  { transform: "translate(5px,-40px) scale(0.95)",    opacity: "0.7" },
          "50%":  { transform: "translate(-7px,-90px) scale(1.15)",   opacity: "0.6" },
          "70%":  { transform: "translate(9px,-145px) scale(1.4)",    opacity: "0.35" },
          "90%":  { transform: "translate(-3px,-200px) scale(1.7)",   opacity: "0.1" },
          "100%": { transform: "translate(0,-235px) scale(1.95)",     opacity: "0"   },
        },
        scrollDot: {
          "0%":   { transform: "translateY(0)",  opacity: "1" },
          "60%":  { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)",  opacity: "0" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(4px)" },
        },
        cupBob: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(-1.5deg)" },
          "50%":      { transform: "translate3d(0,-14px,0) rotate(1.5deg)" },
        },
        coffeeRipple: {
          "0%, 100%": { transform: "scaleX(1) skewX(0deg)" },
          "50%":      { transform: "scaleX(1.04) skewX(-1deg)" },
        },
        beanOrbit: {
          "0%":   { transform: "translate(0,0) rotate(0deg)" },
          "25%":  { transform: "translate(14px,-20px) rotate(90deg)" },
          "50%":  { transform: "translate(28px,0) rotate(180deg)" },
          "75%":  { transform: "translate(14px,20px) rotate(270deg)" },
          "100%": { transform: "translate(0,0) rotate(360deg)" },
        },
        // Saucer wobbles in counter-phase to the cup
        saucerWobble: {
          "0%, 100%": { transform: "rotate(1deg)" },
          "50%":      { transform: "rotate(-1deg)" },
        },
        // Gold shine sweeps diagonally across the cup body
        cupShine: {
          "0%":   { transform: "translateX(0) rotate(20deg)",   opacity: "0" },
          "30%":  { opacity: "1" },
          "100%": { transform: "translateX(360px) rotate(20deg)", opacity: "0" },
        },
        fadeUpSoft: {
          "0%":   { opacity: "0", transform: "translate3d(0,20px,0)" },
          "100%": { opacity: "1", transform: "translate3d(0,0,0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
