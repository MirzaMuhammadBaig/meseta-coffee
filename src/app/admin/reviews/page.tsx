import { Globe, MessageSquareQuote, Star } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import {
  deleteReview,
  listReviewsAdmin,
  toggleReviewFeatured,
  type ReviewRow,
} from "@/lib/admin/inbox";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await listReviewsAdmin();
  const websiteReviews = reviews.filter((r) => r.source === "website");
  const externalReviews = reviews.filter((r) => r.source !== "website");

  async function setFeatured(id: string, featured: boolean) {
    "use server";
    await toggleReviewFeatured(id, featured);
  }
  async function remove(id: string) {
    "use server";
    await deleteReview(id);
  }

  return (
    <>
      <PageHeading
        eyebrow="Inbox"
        title="Reviews"
        description="Feature the best ones — they appear in the public reviews carousel."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ReviewColumn
          title="External reviews"
          subtitle="Synced from Google, foodpanda, Instagram, etc. Delete any you don't want shown."
          icon={Globe}
          accent="text-blue-600 bg-blue-50"
          reviews={externalReviews}
          setFeatured={setFeatured}
          remove={remove}
          emptyMessage="No external reviews yet."
        />
        <ReviewColumn
          title="Website reviews"
          subtitle="Guests left these on the public site. Approve the good ones via Feature."
          icon={MessageSquareQuote}
          accent="text-matcha-700 bg-matcha-500/15"
          reviews={websiteReviews}
          setFeatured={setFeatured}
          remove={remove}
          emptyMessage="No website reviews yet. Share /reviews so guests can leave one."
        />
      </div>
    </>
  );
}

function ReviewColumn({
  title,
  subtitle,
  icon: Icon,
  accent,
  reviews,
  setFeatured,
  remove,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  icon: typeof Star;
  accent: string;
  reviews: ReviewRow[];
  setFeatured: (id: string, featured: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  emptyMessage: string;
}) {
  return (
    <section>
      <header className="mb-4 flex items-center gap-3">
        <span
          className={
            "flex h-9 w-9 items-center justify-center rounded-xl " + accent
          }
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="font-display text-xl text-coffee-800">
            {title}
            <span className="ml-2 rounded-full bg-coffee-100 px-2 py-0.5 text-[10px] font-semibold text-coffee-600">
              {reviews.length}
            </span>
          </h2>
          <p className="text-xs text-coffee-500">{subtitle}</p>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-coffee-500 ring-1 ring-coffee-100">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-coffee-800">
                    {r.author_name}
                  </p>
                  <p className="text-xs text-coffee-400">
                    {r.source} ·{" "}
                    {r.reviewed_at
                      ? formatDate(r.reviewed_at)
                      : formatDate(r.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-gold-500 text-gold-500"
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-coffee-700">
                "{r.body}"
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <form action={setFeatured.bind(null, r.id, !r.is_featured)}>
                  <button
                    type="submit"
                    className={
                      "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition " +
                      (r.is_featured
                        ? "bg-gold-500 text-coffee-900 hover:bg-gold-400"
                        : "border border-coffee-200 text-coffee-600 hover:bg-cream-100")
                    }
                  >
                    {r.is_featured ? "Featured" : "Feature"}
                  </button>
                </form>
                <form action={remove.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
