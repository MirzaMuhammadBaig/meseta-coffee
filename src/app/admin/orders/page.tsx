import Link from "next/link";
import { Download, Search } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import { listOrders } from "@/lib/admin/orders";
import type { OrderStatus } from "@/lib/admin/order-types";
import { describeRange } from "@/lib/admin/date-range";
import { formatPkr, formatDate } from "@/lib/utils";

export const metadata = { title: "Orders" };

const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_TONE: Record<string, string> = {
  placed: "bg-gold-500/15 text-gold-700",
  accepted: "bg-blue-50 text-blue-700",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-matcha-500/15 text-matcha-700",
  completed: "bg-matcha-500/25 text-matcha-800",
  cancelled: "bg-red-50 text-red-700",
};

const PAY_TONE: Record<string, string> = {
  captured: "bg-matcha-500/15 text-matcha-700",
  authorized: "bg-blue-50 text-blue-700",
  pending: "bg-gold-500/15 text-gold-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-coffee-100 text-coffee-600",
  refunded: "bg-coffee-100 text-coffee-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; from?: string; to?: string };
}) {
  const status = (searchParams.status as OrderStatus | "all") ?? "all";
  const q = searchParams.q ?? "";
  const from = searchParams.from ?? null;
  const to = searchParams.to ?? null;
  const orders = await listOrders({ status, q, from, to });

  // Preserve filter state across the chip + search-bar links.
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (from) baseParams.set("from", from);
  if (to) baseParams.set("to", to);

  const csvHref = `/api/admin/orders/csv?${(() => {
    const sp = new URLSearchParams(baseParams);
    if (status !== "all") sp.set("status", status);
    return sp.toString();
  })()}`;

  return (
    <>
      <PageHeading
        eyebrow="Operations"
        title="Orders"
        description="Walk every order through the kitchen flow. Click an order to see details."
        actions={
          <a
            href={csvHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-coffee-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee-600 transition hover:border-coffee-300 hover:text-coffee-800"
          >
            <Download className="h-3 w-3" /> Export CSV
          </a>
        }
      />

      <DateRangeFilter className="mb-4" />

      <form className="mb-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="status" value={status} />
        {from && <input type="hidden" name="from" value={from} />}
        {to && <input type="hidden" name="to" value={to} />}
        <div className="relative flex-1 sm:min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Order #, name or phone"
            className="w-full rounded-full border border-coffee-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
          />
        </div>
        {STATUSES.map((s) => {
          const active = status === s.value;
          const sp = new URLSearchParams(baseParams);
          sp.set("status", s.value);
          return (
            <Link
              key={s.value}
              href={`/admin/orders?${sp.toString()}`}
              className={
                "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition " +
                (active
                  ? "bg-coffee-700 text-cream-50"
                  : "border border-coffee-100 bg-white text-coffee-600 hover:border-coffee-300")
              }
            >
              {s.label}
            </Link>
          );
        })}
        <button
          type="submit"
          className="rounded-full bg-coffee-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-50 hover:bg-coffee-800"
        >
          Search
        </button>
      </form>

      <p className="mb-4 text-xs text-coffee-500">
        <span className="font-semibold text-coffee-700">{orders.length}</span>{" "}
        order{orders.length === 1 ? "" : "s"} · {describeRange(from, to)}
        {status !== "all" && (
          <>
            {" "}· status{" "}
            <span className="font-semibold text-coffee-700">{status}</span>
          </>
        )}
        {q && (
          <>
            {" "}· matching{" "}
            <span className="font-semibold text-coffee-700">&ldquo;{q}&rdquo;</span>
          </>
        )}
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">When</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coffee-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-coffee-500">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream-100/30">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${o.number}`}
                      className="font-mono text-xs font-semibold text-coffee-800 hover:text-gold-600"
                    >
                      {o.number}
                    </Link>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-coffee-400">
                      {o.fulfilment}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-coffee-800">{o.customer_name}</p>
                    <p className="text-xs text-coffee-400">{o.customer_phone}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-coffee-500">
                    {formatDate(o.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                        (PAY_TONE[o.payment_status] ?? "bg-coffee-100 text-coffee-700")
                      }
                    >
                      {o.payment_status}
                    </span>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-coffee-400">
                      {o.payment_method}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                        (STATUS_TONE[o.status] ?? "bg-coffee-100 text-coffee-700")
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-coffee-800">
                    {formatPkr(o.total_pkr)}
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
