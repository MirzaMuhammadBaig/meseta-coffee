import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { getOrderByNumber, updateOrderStatus } from "@/lib/admin/orders";
import { getActiveBranches } from "@/lib/data/branches";
import { STATUS_FLOW, type OrderStatus } from "@/lib/admin/order-types";
import { formatPkr, formatDate } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  placed: "bg-gold-500/15 text-gold-700",
  accepted: "bg-blue-50 text-blue-700",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-matcha-500/15 text-matcha-700",
  completed: "bg-matcha-500/25 text-matcha-800",
  cancelled: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Mark accepted",
  accepted: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark completed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { number: string };
}) {
  const [order, branches] = await Promise.all([
    getOrderByNumber(params.number),
    getActiveBranches(),
  ]);
  if (!order) notFound();

  const branch = order.branch_id
    ? branches.find((b) => b.id === order.branch_id) ?? null
    : null;
  const next = STATUS_FLOW[order.status];

  // For tel:/wa.me links — strip everything except digits.
  const phoneDigits = order.customer_phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
    `Hi ${order.customer_name.split(" ")[0]}! Following up on your Meseta order ${order.number}.`,
  )}`;

  async function setStatus(target: OrderStatus) {
    "use server";
    await updateOrderStatus(params.number, target);
  }

  return (
    <>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-500 hover:text-coffee-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <PageHeading
        eyebrow={`Order · ${formatDate(order.created_at)}${branch ? ` · ${branch.short_name ?? branch.name}` : ""}`}
        title={order.number}
        description={`${order.customer_name} · ${order.customer_phone}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Items */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Items</h2>
          <ul className="mt-4 divide-y divide-coffee-100">
            {order.items.map((l) => (
              <li
                key={l.slug}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <span className="flex-1">
                  <span className="text-coffee-800">{l.name}</span>
                  <span className="ml-2 text-xs text-coffee-400">
                    × {l.qty} · {formatPkr(l.price_pkr)} each
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-coffee-800">
                  {formatPkr(l.qty * l.price_pkr)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-coffee-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-coffee-500">Subtotal</dt>
              <dd className="tabular-nums text-coffee-700">
                {formatPkr(order.subtotal_pkr)}
              </dd>
            </div>
            {order.discount_pkr > 0 && (
              <div className="flex justify-between">
                <dt className="text-coffee-500">
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                </dt>
                <dd className="tabular-nums text-red-700">
                  − {formatPkr(order.discount_pkr)}
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-dashed border-coffee-100 pt-3">
              <dt className="text-xs uppercase tracking-[0.18em] text-coffee-500">
                Total
              </dt>
              <dd className="font-display text-2xl text-coffee-800">
                {formatPkr(order.total_pkr)}
              </dd>
            </div>
          </dl>

          {order.notes && (
            <div className="mt-6 rounded-xl bg-cream-100/60 p-4 text-sm text-coffee-700">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-400">
                Notes
              </p>
              <p className="mt-1">{order.notes}</p>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Status
            </p>
            <p className="mt-2">
              <span
                className={
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] " +
                  (STATUS_TONE[order.status] ?? "bg-coffee-100 text-coffee-700")
                }
              >
                {order.status}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {next.map((t) => (
                <form key={t} action={setStatus.bind(null, t)}>
                  <button
                    type="submit"
                    className={
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition " +
                      (t === "cancelled"
                        ? "border border-red-200 text-red-700 hover:bg-red-50"
                        : "bg-coffee-700 text-cream-50 hover:bg-coffee-800")
                    }
                  >
                    {STATUS_LABEL[t]}
                  </button>
                </form>
              ))}
              {next.length === 0 && (
                <p className="text-xs text-coffee-400">
                  No further transitions.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Customer
            </p>
            <p className="mt-2 font-semibold text-coffee-800">
              {order.customer_name}
            </p>
            <p className="mt-0.5 break-all text-sm text-coffee-600">
              {order.customer_phone}
            </p>
            {order.customer_email && (
              <p className="mt-0.5 inline-flex items-center gap-1.5 break-all text-xs text-coffee-500">
                <Mail className="h-3 w-3 shrink-0" />
                {order.customer_email}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-coffee-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-coffee-700 transition hover:border-coffee-700 hover:bg-coffee-700 hover:text-cream-50"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-matcha-500/40 bg-matcha-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-matcha-700 transition hover:bg-matcha-500 hover:text-cream-50"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Payment
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold text-coffee-800">
                {order.payment_method}
              </span>
              <span className="ml-2 text-coffee-500">
                · {order.payment_status}
              </span>
            </p>
            {order.paid_at && (
              <p className="mt-1 text-xs text-coffee-400">
                Paid {formatDate(order.paid_at)}
              </p>
            )}
            {order.safepay_tracker && (
              <p className="mt-3 break-all font-mono text-[11px] text-coffee-400">
                Safepay: {order.safepay_tracker}
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Fulfilment
            </p>
            <p className="mt-2 font-semibold capitalize text-coffee-800">
              {order.fulfilment}
            </p>
            {order.address && (
              <p className="mt-1 text-sm text-coffee-600">{order.address}</p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
