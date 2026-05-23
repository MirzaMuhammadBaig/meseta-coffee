import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  CreditCard,
  Inbox,
  Receipt,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeading from "@/components/admin/PageHeading";
import StatCard from "@/components/admin/StatCard";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

type OrderRow = {
  id: string;
  number: string;
  customer_name: string;
  total_pkr: number;
  status: string;
  payment_status: string;
  payment_method: string;
  items: { qty: number; name: string }[] | null;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  placed: "bg-gold-500/15 text-gold-700",
  accepted: "bg-blue-50 text-blue-700",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-matcha-500/15 text-matcha-700",
  completed: "bg-matcha-500/25 text-matcha-800",
  cancelled: "bg-red-50 text-red-700",
};

function startOfTodayUtc() {
  // The server is UTC; "today" for the admin is locale-dependent but
  // we approximate by using midnight UTC. Good enough for a single café.
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgoUtc(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();
  const todayIso = startOfTodayUtc();
  const fourteenDaysAgoIso = daysAgoUtc(14);

  // Pull everything we need in parallel.
  const [
    todayOrdersRes,
    last14OrdersRes,
    pendingOrdersRes,
    reservationsRes,
    messagesRes,
    menuItemsRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total_pkr, payment_status")
      .gte("created_at", todayIso),
    supabase
      .from("orders")
      .select("id, number, customer_name, total_pkr, status, payment_status, payment_method, items, created_at")
      .gte("created_at", fourteenDaysAgoIso)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["placed", "accepted", "preparing"]),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("handled", false),
    supabase
      .from("menu_items")
      .select("id, is_disabled"),
  ]);

  const todayOrders = todayOrdersRes.data ?? [];
  const last14: OrderRow[] = (last14OrdersRes.data as OrderRow[]) ?? [];

  const revenueToday = todayOrders
    .filter((o) => o.payment_status === "captured" || o.payment_status === "pending")
    .reduce((s, o) => s + (o.total_pkr ?? 0), 0);

  const orderCountToday = todayOrders.length;
  const aov = orderCountToday > 0 ? Math.round(revenueToday / orderCountToday) : 0;

  // Top items in the last 14 days (group by name)
  const itemCounts = new Map<string, number>();
  for (const o of last14) {
    if (!o.items) continue;
    for (const line of o.items) {
      itemCounts.set(line.name, (itemCounts.get(line.name) ?? 0) + (line.qty ?? 0));
    }
  }
  const topItems = [...itemCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 14-day mini trend (per-day count)
  const trend = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    trend.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of last14) {
    const key = o.created_at.slice(0, 10);
    if (trend.has(key)) trend.set(key, (trend.get(key) ?? 0) + 1);
  }
  const trendValues = [...trend.values()];
  const trendMax = Math.max(1, ...trendValues);

  const pendingOrders = pendingOrdersRes.count ?? 0;
  const pendingReservations = reservationsRes.count ?? 0;
  const unreadMessages = messagesRes.count ?? 0;
  const totalItems = menuItemsRes.data?.length ?? 0;
  const disabledItems =
    menuItemsRes.data?.filter((m) => m.is_disabled).length ?? 0;

  return (
    <>
      <PageHeading
        eyebrow="Today"
        title="Dashboard"
        description="A live snapshot of orders, reservations and inbox."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue today"
          value={formatPkr(revenueToday)}
          hint={`${orderCountToday} order${orderCountToday === 1 ? "" : "s"} · see breakdown`}
          icon={Receipt}
          tone="positive"
          href="/admin/revenue?range=today"
        />
        <StatCard
          label="Avg. order value"
          value={formatPkr(aov)}
          hint="Today"
          icon={TrendingUp}
        />
        <StatCard
          label="Orders in queue"
          value={String(pendingOrders)}
          hint="placed · accepted · preparing"
          icon={CreditCard}
          tone={pendingOrders > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Active menu items"
          value={`${totalItems - disabledItems} / ${totalItems}`}
          hint={`${disabledItems} disabled`}
          icon={UtensilsCrossed}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
                Recent orders
              </p>
              <h2 className="mt-1 font-display text-xl text-coffee-800">
                Last 14 days
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-600 hover:text-coffee-900"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {last14.length === 0 ? (
            <p className="mt-8 rounded-xl bg-cream-100/60 p-6 text-center text-sm text-coffee-500">
              No orders in the last 14 days. Once customers start ordering,
              they'll appear here.
            </p>
          ) : (
            <div className="mt-5 -mx-2 overflow-x-auto px-2">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.2em] text-coffee-400">
                  <tr className="border-b border-coffee-100">
                    <th className="py-2 font-semibold">Order</th>
                    <th className="py-2 font-semibold">Customer</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {last14.slice(0, 7).map((o) => (
                    <tr key={o.id} className="border-b border-coffee-100/60 last:border-0">
                      <td className="py-3">
                        <Link
                          href={`/admin/orders/${o.number}`}
                          className="font-mono text-xs font-semibold text-coffee-800 hover:text-gold-600"
                        >
                          {o.number}
                        </Link>
                      </td>
                      <td className="py-3 text-coffee-600">{o.customer_name}</td>
                      <td className="py-3">
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                            (STATUS_TONE[o.status] ?? "bg-coffee-100 text-coffee-700")
                          }
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-coffee-800">
                        {formatPkr(o.total_pkr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 14-day spark bars */}
              <div className="mt-6 flex items-end gap-1">
                {trendValues.map((v, i) => (
                  <div
                    key={i}
                    title={`${v} orders`}
                    className="flex-1 rounded-sm bg-coffee-700/15 transition-colors hover:bg-coffee-700/30"
                    style={{ height: `${(v / trendMax) * 56 + 4}px` }}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-coffee-400">
                Orders per day (14d)
              </p>
            </div>
          )}
        </section>

        {/* Side cards */}
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Needs your attention
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <InboxRow
                href="/admin/orders"
                icon={CreditCard}
                label="Orders in queue"
                count={pendingOrders}
              />
              <InboxRow
                href="/admin/reservations"
                icon={CalendarCheck2}
                label="Pending reservations"
                count={pendingReservations}
              />
              <InboxRow
                href="/admin/messages"
                icon={Inbox}
                label="Unread messages"
                count={unreadMessages}
              />
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Top items · 14 days
            </p>
            {topItems.length === 0 ? (
              <p className="mt-3 text-sm text-coffee-500">
                No sales data yet.
              </p>
            ) : (
              <ol className="mt-3 space-y-2 text-sm">
                {topItems.map(([name, qty], i) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-coffee-700">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-[10px] font-bold text-gold-700">
                        {i + 1}
                      </span>
                      <span className="truncate">{name}</span>
                    </span>
                    <span className="font-semibold text-coffee-800">{qty}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function InboxRow({
  href,
  icon: Icon,
  label,
  count,
}: {
  href: string;
  icon: typeof ShoppingBag;
  label: string;
  count: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-coffee-700 transition-colors hover:bg-cream-100"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-coffee-500" strokeWidth={1.8} />
          {label}
        </span>
        <span
          className={
            "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums " +
            (count > 0
              ? "bg-gold-500/20 text-gold-700"
              : "bg-coffee-100 text-coffee-500")
          }
        >
          {count}
        </span>
      </Link>
    </li>
  );
}
