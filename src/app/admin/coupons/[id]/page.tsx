import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, Tag } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import CouponForm from "@/components/admin/CouponForm";
import { deleteCoupon, updateCoupon } from "@/lib/admin/coupons";
import { getCouponWithDetail } from "@/lib/admin/promo-stats";
import { formatDate, formatPkr } from "@/lib/utils";

export const metadata = { title: "Coupon detail" };

const STATUS_TONE: Record<string, string> = {
  active: "bg-matcha-500/15 text-matcha-700",
  exhausted: "bg-gold-500/15 text-gold-700",
  expired: "bg-red-50 text-red-700",
  inactive: "bg-coffee-100 text-coffee-500",
};

const ORDER_STATUS_TONE: Record<string, string> = {
  placed: "bg-gold-500/15 text-gold-700",
  accepted: "bg-blue-50 text-blue-700",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-matcha-500/15 text-matcha-700",
  completed: "bg-matcha-500/25 text-matcha-800",
  cancelled: "bg-red-50 text-red-700",
};

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const { coupon, stats, status, recent_orders } = await getCouponWithDetail(
    params.id,
  );
  if (!coupon) notFound();

  async function onSave(fd: FormData) {
    "use server";
    await updateCoupon(params.id, fd);
  }
  async function onDelete() {
    "use server";
    await deleteCoupon(params.id);
    redirect("/admin/coupons");
  }

  const usagePct =
    coupon.max_uses != null && coupon.max_uses > 0
      ? Math.min(100, Math.round((coupon.uses_count / coupon.max_uses) * 100))
      : null;

  return (
    <>
      <Link
        href="/admin/coupons"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-500 hover:text-coffee-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All coupons
      </Link>

      <PageHeading
        eyebrow="Promotions → Coupons"
        title={coupon.code}
        description={
          coupon.description ??
          `${coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `${formatPkr(coupon.discount_value)} off`} · ${stats.orders_count} redemption${stats.orders_count === 1 ? "" : "s"}.`
        }
        actions={
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] " +
              (STATUS_TONE[status] ?? "bg-coffee-100 text-coffee-600")
            }
          >
            <Tag className="h-3 w-3" />
            {status}
          </span>
        }
      />

      {/* Stats panel */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Redemptions" value={stats.orders_count.toLocaleString()} />
        <Stat
          label="Usage cap"
          value={
            coupon.max_uses != null
              ? `${coupon.uses_count} / ${coupon.max_uses}`
              : `${coupon.uses_count} / ∞`
          }
          progressPct={usagePct ?? undefined}
        />
        <Stat
          label="Customer saved"
          value={formatPkr(stats.total_saved_pkr)}
          tone="positive"
        />
        <Stat
          label="Revenue"
          value={formatPkr(stats.total_revenue_pkr)}
          hint={
            stats.orders_count > 0
              ? `AOV ${formatPkr(stats.avg_order_value_pkr)}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
        {/* Edit form (column 1) */}
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
            Edit
          </h2>
          <CouponForm coupon={coupon} onSave={onSave} onDelete={onDelete} />
        </section>

        {/* Recent orders that used this coupon (column 2) */}
        <section>
          <h2 className="mb-3 flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
            <span>Recent orders using this code</span>
            <span className="font-normal normal-case tracking-normal text-coffee-500">
              {stats.first_used_at && (
                <>
                  first {formatDate(stats.first_used_at)} · last{" "}
                  {formatDate(stats.last_used_at!)}
                </>
              )}
            </span>
          </h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 text-right font-semibold">Saved</th>
                    <th className="px-4 py-3 text-right font-semibold">Paid</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-100">
                  {recent_orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-coffee-500"
                      >
                        No one has used this coupon yet.
                      </td>
                    </tr>
                  ) : (
                    recent_orders.map((o) => (
                      <tr key={o.id} className="hover:bg-cream-100/30">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-coffee-800">
                          {o.number}
                        </td>
                        <td className="px-4 py-3 text-coffee-700">
                          {o.customer_name}
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-500">
                          {formatDate(o.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-matcha-700">
                          {formatPkr(o.discount_pkr)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-coffee-800">
                          {formatPkr(o.total_pkr)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                              (ORDER_STATUS_TONE[o.status] ??
                                "bg-coffee-100 text-coffee-700")
                            }
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <Link
                            href={`/admin/orders/${o.number}`}
                            aria-label="Open order"
                            className="text-coffee-400 hover:text-coffee-700"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  progressPct,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive";
  progressPct?: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_-22px_rgba(66,41,26,0.2)] ring-1 ring-coffee-100">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
        {label}
      </p>
      <p
        className={
          "mt-1 truncate font-display text-xl tabular-nums sm:text-2xl " +
          (tone === "positive" ? "text-matcha-700" : "text-coffee-800")
        }
      >
        {value}
      </p>
      {progressPct != null && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-100">
          <div
            className="h-full bg-coffee-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-1 text-[11px] text-coffee-500">{hint}</p>}
    </div>
  );
}
