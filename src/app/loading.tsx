import RouteLoading from "@/components/RouteLoading";

/**
 * First-paint loader.
 *
 * Covers the very first arrival on the site — while the root layout
 * subtree (store settings, fonts, the page itself) is still loading.
 * Same anti-flash rule: if everything is ready quickly, this resolves
 * before the loader fades in and the visitor sees nothing.
 */
export default function Loading() {
  return <RouteLoading />;
}
