import CoffeeLoader from "@/components/CoffeeLoader";

/**
 * Full-page route loading screen used by every App Router `loading.tsx`.
 *
 * Anti-flash by design. The cup is held fully invisible for the first
 * ~420ms via a *delayed* fade-in: `animation-fill-mode: both` pins the
 * element at the `from` keyframe (`opacity: 0`) for the entire delay.
 *
 * The vast majority of navigations resolve faster than 420ms, so
 * `loading.tsx` unmounts again *before* the loader ever becomes
 * visible — fast loads show nothing at all, no flash. Only a genuinely
 * slow load (still fetching after ~420ms) fades the brewing cup in.
 */
export default function RouteLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <style>{"@keyframes route-loading-in{from{opacity:0}to{opacity:1}}"}</style>
      <div style={{ animation: "route-loading-in 260ms ease-out 420ms both" }}>
        <CoffeeLoader size="lg" />
      </div>
    </div>
  );
}
