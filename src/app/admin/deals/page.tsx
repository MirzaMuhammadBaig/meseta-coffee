import Link from "next/link";
import { BarChart3, Plus } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { listDeals } from "@/lib/admin/deals";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Deals" };

export default async function AdminDealsPage() {
  const deals = await listDeals();
  const active = deals.filter((d) => d.is_active).length;

  return (
    <>
      <PageHeading
        eyebrow="Promotions"
        title="Deals"
        description="Scheduled promotions shown on the menu. Apply to the whole menu, a category, or a single item."
        actions={
          <Link
            href="/admin/deals/new"
            className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-coffee-800"
          >
            <Plus className="h-3.5 w-3.5" /> New deal
          </Link>
        }
      />

      <p className="mb-5 text-xs text-coffee-500">
        <span className="font-semibold text-coffee-700">{active}</span> active ·{" "}
        {deals.length} total
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Deal</th>
              <th className="px-5 py-3 font-semibold">Discount</th>
              <th className="px-5 py-3 font-semibold">Applies to</th>
              <th className="px-5 py-3 font-semibold">Window</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coffee-100">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-coffee-500">
                  No deals yet.{" "}
                  <Link
                    href="/admin/deals/new"
                    className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
                  >
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              deals.map((d) => (
                <tr key={d.id} className="hover:bg-cream-100/30">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/deals/${d.id}`}
                      className="inline-flex items-center gap-2 font-semibold text-coffee-800 hover:text-gold-600"
                    >
                      <BarChart3 className="h-3.5 w-3.5 text-gold-500" />
                      {d.title}
                    </Link>
                    {d.description && (
                      <p className="mt-0.5 text-xs text-coffee-400">
                        {d.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-coffee-700">
                    {d.discount_type === "percentage"
                      ? `${d.discount_value}% off`
                      : `Rs ${d.discount_value} off`}
                  </td>
                  <td className="px-5 py-3 text-coffee-700 capitalize">
                    {d.applies_to === "all"
                      ? "Entire menu"
                      : `${d.applies_to}: ${d.target_slug ?? "—"}`}
                  </td>
                  <td className="px-5 py-3 text-xs text-coffee-500">
                    {d.starts_at ? formatDate(d.starts_at) : "anytime"}
                    {" → "}
                    {d.ends_at ? formatDate(d.ends_at) : "no end"}
                  </td>
                  <td className="px-5 py-3">
                    {d.is_active ? (
                      <span className="rounded-full bg-matcha-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-matcha-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-500">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
