import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3, ChevronRight } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import DealForm from "@/components/admin/DealForm";
import { deleteDeal, updateDeal } from "@/lib/admin/deals";
import { getDealWithDetail } from "@/lib/admin/promo-stats";
import { formatDate, formatPkr } from "@/lib/utils";

export const metadata = { title: "Deal detail" };

const STATUS_TONE: Record<string, string> = {
  active: "bg-matcha-500/15 text-matcha-700",
  scheduled: "bg-gold-500/15 text-gold-700",
  ended: "bg-coffee-100 text-coffee-600",
  paused: "bg-red-50 text-red-700",
};

const ORDER_STATUS_TONE: Record<string, string> = {
  placed: "bg-gold-500/15 text-gold-700",
  accepted: "bg-blue-50 text-blue-700",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-matcha-500/15 text-matcha-700",
  completed: "bg-matcha-500/25 text-matcha-800",
  cancelled: "bg-red-50 text-red-700",
};

export default async function EditDealPage({
  params,
}: {
  params: { id: string };
}) {
  const { deal, stats, status, recent_orders } = await getDealWithDetail(
    params.id,
  );
  if (!deal) notFound();

  async function onSave(fd: FormData) {
    "use server";
    await updateDeal(params.id, fd);
  }
  async function onDelete() {
    "use server";
    await deleteDeal(params.id);
    redirect("/admin/deals");
  }

  return (
    <>
      <Link
        href="/admin/deals"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-500 hover:text-coffee-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All deals
      </Link>

      <PageHeading
        eyebrow="Promotions → Deals"
        title={deal.title}
        description={
          deal.description ??
          `${deal.discount_type === "percentage" ? `${deal.discount_value}% off` : `${formatPkr(deal.discount_value)} off`} · applies to ${deal.applies_to === "all" ? "the entire menu" : `${deal.applies_to} "${deal.target_slug ?? "—"}"`}.`
        }
        actions={
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] " +
              (STATUS_TONE[status] ?? "bg-coffee-100 text-coffee-600")
            }
          >
            <BarChart3 className="h-3 w-3" />
            {status}
          </span>
        }
      />

      {/* Stats panel */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Orders touched" value={stats.orders_count.toLocaleString()} />
        <Stat
          label="Discounted lines"
          value={stats.lines_count.toLocaleString()}
          hint={
            stats.lines_count > 0
              ? `${(stats.lines_count / Math.max(1, stats.orders_count)).toFixed(1)} per order`
              : undefined
          }
        />
        <Stat
          label="Customer saved"
          value={formatPkr(stats.total_saved_pkr)}
          tone="positive"
        />
        <Stat label="Revenue" value={formatPkr(stats.total_revenue_pkr)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
            Edit
          </h2>
          <DealForm deal={deal} onSave={onSave} onDelete={onDelete} />
        </section>

        <section>
          <h2 className="mb-3 flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
            <span>Recent orders that triggered this deal</span>
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
                        This deal has not been triggered by any order yet.
                      </td>
                    </tr>
                  ) : (
                    recent_orders.map((o) => {
                      // How much THIS deal saved on THIS order (not the order's total
                      // discount, which can also include a coupon).
                      const dealSaved = (o.items ?? [])
                        .filter((i) => i.deal_id === deal.id)
                        .reduce(
                          (s, i) =>
                            s +
                            ((i.original_price_pkr ?? i.price_pkr) -
                              i.price_pkr) *
                              (i.qty ?? 1),
                          0,
                        );
                      return (
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
                            {formatPkr(dealSaved)}
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
                      );
                    })
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
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive";
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
      {hint && <p className="mt-1 text-[11px] text-coffee-500">{hint}</p>}
    </div>
  );
}
