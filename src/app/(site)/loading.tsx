import RouteLoading from "@/components/RouteLoading";

/**
 * Shown while any public page (home, menu, gallery, reviews, checkout,
 * …) renders / fetches its data. The loader only appears if the load is
 * genuinely slow — fast loads resolve before it fades in, so there is
 * no flash.
 */
export default function Loading() {
  return <RouteLoading />;
}
