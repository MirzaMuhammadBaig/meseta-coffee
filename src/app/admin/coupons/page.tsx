import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { listCoupons } from "@/lib/admin/coupons";
import { formatDate, formatPkr } from "@/lib/utils";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  const active = coupons.filter((c) => c.is_active).length;

  return (
    <>
      <PageHeading
        eyebrow="Promotions"
        title="Coupons"
        description="Discount codes customers can enter at checkout."
        actions={
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-coffee-800"
          >
            <Plus className="h-3.5 w-3.5" /> New coupon
          </Link>
        }
      />

      <p className="mb-5 text-xs text-coffee-500">
        <span className="font-semibold text-coffee-700">{active}</span> active ·{" "}
        {coupons.length} total
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Code</th>
              <th className="px-5 py-3 font-semibold">Discount</th>
              <th className="px-5 py-3 font-semibold">Limits</th>
              <th className="px-5 py-3 font-semibold">Used</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coffee-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-coffee-500">
                  No coupons yet.{" "}
                  <Link
                    href="/admin/coupons/new"
                    className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
                  >
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-cream-100/30">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/coupons/${c.id}`}
                      className="inline-flex items-center gap-2 font-mono font-semibold text-coffee-800 hover:text-gold-600"
                    >
                      <Tag className="h-3.5 w-3.5 text-gold-500" />
                      {c.code}
                    </Link>
                    {c.description && (
                      <p className="mt-0.5 text-xs text-coffee-400">
                        {c.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-coffee-700">
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}% off`
                      : `${formatPkr(c.discount_value)} off`}
                    {c.min_subtotal_pkr && c.min_subtotal_pkr > 0 ? (
                      <p className="text-[11px] text-coffee-400">
                        Min spend {formatPkr(c.min_subtotal_pkr)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-xs text-coffee-500">
                    {c.max_uses ? `${c.max_uses} max uses` : "Unlimited uses"}
                    {c.expires_at && (
                      <p>Expires {formatDate(c.expires_at)}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold tabular-nums text-coffee-700">
                    {c.uses_count}
                  </td>
                  <td className="px-5 py-3">
                    {c.is_active ? (
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
