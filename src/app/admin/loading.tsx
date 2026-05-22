import RouteLoading from "@/components/RouteLoading";

/**
 * Shown while any admin page renders / fetches its data — the sidebar
 * and top bar stay put, only the content area shows the loader. Like
 * the public loader, it only appears for genuinely slow loads.
 */
export default function Loading() {
  return <RouteLoading />;
}
