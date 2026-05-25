import Link from "next/link";
import { CalendarRange, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import StatCard from "@/components/admin/StatCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Revenue" };

type Range = "today" | "yesterday" | "7d" | "30d" | "month" | "all" | "custom";

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function rangeBounds(
  range: Range,
  from?: string,
  to?: string,
): { from: Date | null; to: Date | null; label: string } {
  const now = new Date();
  const today = startOfTodayUtc();

  if (range === "today") {
    return { from: today, to: null, label: "Today" };
  }
  if (range === "yesterday") {
    const y = new Date(today);
    y.setUTCDate(y.getUTCDate() - 1);
    return { from: y, to: today, label: "Yesterday" };
  }
  if (range === "7d") {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - 6);
    return { from: d, to: null, label: "Last 7 days" };
  }
  if (range === "30d") {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - 29);
    return { from: d, to: null, label: "Last 30 days" };
  }
  if (range === "month") {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    return { from: d, to: null, label: "This month" };
  }
  if (range === "all") {
    return { from: null, to: null, label: "All time" };
  }
  // custom
  return {
    from: from ? new Date(`${from}T00:00:00Z`) : null,
    to: to ? new Date(`${to}T23:59:59Z`) : null,
    label:
      from && to ? `${from} → ${to}` : "Custom",
  };
}

type OrderRow = {
  total_pkr: number;
  payment_status: string;
  payment_method: string;
  status: string;
  created_at: string;
};

function isPaidLike(o: OrderRow) {
  // Count an order toward revenue if either the customer's card was
  // captured, or the staff completed the order (e.g. cash on pickup).
  if (o.payment_status === "captured" || o.payment_status === "authorized")
    return true;
  if (o.payment_method === "cash" && o.status !== "cancelled") return true;
  return false;
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const range = (RANGES.find((r) => r.value === searchParams.range)?.value ??
    "30d") as Range;
  const bounds = rangeBounds(range, searchParams.from, searchParams.to);

  let q = supabase
    .from("orders")
    .select("total_pkr, payment_status, payment_method, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (bounds.from) q = q.gte("created_at", bounds.from.toISOString());
  if (bounds.to) q = q.lt("created_at", bounds.to.toISOString());

  const { data } = await q;
  const rows = ((data as OrderRow[]) ?? []).filter(isPaidLike);

  const revenue = rows.reduce((s, o) => s + (o.total_pkr ?? 0), 0);
  const orderCount = rows.length;
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Bucket by day for the bar chart (only when range spans >= 2 days).
  const dayBuckets = new Map<string, number>();
  for (const o of rows) {
    const k = o.created_at.slice(0, 10);
    dayBuckets.set(k, (dayBuckets.get(k) ?? 0) + (o.total_pkr ?? 0));
  }
  // Show at most 60 buckets
  const series = [...dayBuckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-60);
  const maxBucket = Math.max(1, ...series.map(([, v]) => v));

  return (
    <>
      <PageHeading
        eyebrow="Reports"
        title="Revenue"
        description="Filter by quick range or pick a custom window. Counts captured card and completed-cash orders."
        actions={
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-500 hover:text-coffee-800"
          >
            ← Dashboard
          </Link>
        }
      />

      {/* Range chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {RANGES.map((r) => {
          const active = range === r.value;
          return (
            <Link
              key={r.value}
              href={`/admin/revenue?range=${r.value}`}
              className={
                "rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition " +
                (active
                  ? "bg-coffee-700 text-cream-50"
                  : "border border-coffee-100 bg-white text-coffee-600 hover:border-coffee-300")
              }
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* Custom range picker (only shown when active) */}
      {range === "custom" && (
        <form className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-coffee-100 bg-white p-4">
          <input type="hidden" name="range" value="custom" />
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              From
            </label>
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from ?? ""}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              To
            </label>
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to ?? ""}
              className="input mt-1"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 hover:bg-coffee-800"
          >
            <CalendarRange className="h-3.5 w-3.5" /> Apply
          </button>
          <p className="text-[11px] text-coffee-400">
            Tip: leave one side empty for an open-ended range.
          </p>
        </form>
      )}

      <p className="mb-5 text-xs text-coffee-500">
        Showing <span className="font-semibold text-coffee-700">{bounds.label}</span>
        {range !== "all" &&
          bounds.from &&
          ` (since ${bounds.from.toISOString().slice(0, 10)})`}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Revenue"
          value={formatPkr(revenue)}
          hint={bounds.label.toLowerCase()}
          icon={Receipt}
          tone="positive"
        />
        <StatCard
          label="Orders"
          value={String(orderCount)}
          hint="paid + completed cash"
          icon={ShoppingCart}
        />
        <StatCard
          label="Average order"
          value={formatPkr(aov)}
          hint="revenue / orders"
          icon={TrendingUp}
        />
      </div>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
              Revenue by day
            </p>
            <h2 className="mt-1 font-display text-xl text-coffee-800">
              {bounds.label}
            </h2>
          </div>
          {series.length > 0 && (
            <p className="text-[11px] text-coffee-400">
              Peak day:{" "}
              <span className="font-semibold text-coffee-700 tabular-nums">
                {formatPkr(maxBucket)}
              </span>
            </p>
          )}
        </div>

        {series.length === 0 ? (
          <p className="mt-8 rounded-xl bg-cream-100/60 p-6 text-center text-sm text-coffee-500">
            No paid orders in this range yet.
          </p>
        ) : (
          <>
            <div className="mt-5 flex h-40 items-end gap-1">
              {series.map(([day, value]) => (
                <div
                  key={day}
                  className="group relative flex flex-1 flex-col justify-end"
                  title={`${day} · ${formatPkr(value)}`}
                >
                  <div
                    className="rounded-sm bg-coffee-700/30 transition-colors hover:bg-coffee-700"
                    style={{ height: `${(value / maxBucket) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-coffee-400">
              <span>{series[0][0]}</span>
              <span>{series[series.length - 1][0]}</span>
            </div>
          </>
        )}
      </section>
    </>
  );
}
