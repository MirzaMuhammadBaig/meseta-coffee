import Link from "next/link";
import { Download, Plus, Search, Tag } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { listCouponsWithStats } from "@/lib/admin/promo-stats";
import { formatDate, formatPkr } from "@/lib/utils";

export const metadata = { title: "Coupons" };

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "exhausted", label: "Exhausted" },
  { value: "expired", label: "Expired" },
  { value: "inactive", label: "Inactive" },
] as const;

const STATUS_TONE: Record<string, string> = {
  active: "bg-matcha-500/15 text-matcha-700",
  exhausted: "bg-gold-500/15 text-gold-700",
  expired: "bg-red-50 text-red-700",
  inactive: "bg-coffee-100 text-coffee-500",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  exhausted: "Exhausted",
  expired: "Expired",
  inactive: "Inactive",
};

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const statusFilter = (searchParams.status ?? "all") as
    | "all"
    | "active"
    | "exhausted"
    | "expired"
    | "inactive";
  const q = (searchParams.q ?? "").trim();

  const all = await listCouponsWithStats();
  const filtered = all.filter((c) => {
    if (statusFilter !== "all" && c.effective_status !== statusFilter) return false;
    if (q) {
      const term = q.toLowerCase();
      const hit =
        c.code.toLowerCase().includes(term) ||
        (c.description ?? "").toLowerCase().includes(term);
      if (!hit) return false;
    }
    return true;
  });

  // Roll-ups across the filtered set so the admin sees impact at a glance.
  const totalSaved = filtered.reduce((s, c) => s + c.stats.total_saved_pkr, 0);
  const totalRevenue = filtered.reduce(
    (s, c) => s + c.stats.total_revenue_pkr,
    0,
  );
  const totalOrders = filtered.reduce((s, c) => s + c.stats.orders_count, 0);
  const activeCount = all.filter((c) => c.effective_status === "active").length;

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);

  const csvHref = `/api/admin/coupons/csv?${(() => {
    const sp = new URLSearchParams(baseParams);
    if (statusFilter !== "all") sp.set("status", statusFilter);
    return sp.toString();
  })()}`;

  return (
    <>
      <PageHeading
        eyebrow="Promotions"
        title="Coupons"
        description="Discount codes customers can enter at checkout. Tap any code for stats + the orders that used it."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={csvHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-coffee-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee-600 transition hover:border-coffee-300 hover:text-coffee-800"
            >
              <Download className="h-3 w-3" /> Export CSV
            </a>
            <Link
              href="/admin/coupons/new"
              className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-coffee-800"
            >
              <Plus className="h-3.5 w-3.5" /> New coupon
            </Link>
          </div>
        }
      />

      {/* Roll-up KPIs across the current view */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Active codes" value={String(activeCount)} hint="of " hintEnd={`${all.length} total`} />
        <Kpi label="Redemptions" value={totalOrders.toLocaleString()} hint="orders, in view" />
        <Kpi label="Customer saved" value={formatPkr(totalSaved)} hint="across this view" />
        <Kpi label="Revenue" value={formatPkr(totalRevenue)} hint="from coupon orders" />
      </div>

      {/* Filter bar */}
      <form className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by code or description"
            className="w-full rounded-full border border-coffee-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
          />
        </div>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          const sp = new URLSearchParams(baseParams);
          sp.set("status", f.value);
          return (
            <Link
              key={f.value}
              href={`/admin/coupons?${sp.toString()}`}
              className={
                "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition " +
                (active
                  ? "bg-coffee-700 text-cream-50"
                  : "border border-coffee-100 bg-white text-coffee-600 hover:border-coffee-300")
              }
            >
              {f.label}
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
        <span className="font-semibold text-coffee-700">{filtered.length}</span>{" "}
        coupon{filtered.length === 1 ? "" : "s"} shown
        {statusFilter !== "all" && (
          <>
            {" "}· status{" "}
            <span className="font-semibold text-coffee-700">{statusFilter}</span>
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
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Discount</th>
                <th className="px-5 py-3 font-semibold">Usage</th>
                <th className="px-5 py-3 text-right font-semibold">Customer saved</th>
                <th className="px-5 py-3 text-right font-semibold">Revenue</th>
                <th className="px-5 py-3 font-semibold">Last used</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-coffee-500">
                    No coupons match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const usagePct =
                    c.max_uses != null && c.max_uses > 0
                      ? Math.min(100, Math.round((c.uses_count / c.max_uses) * 100))
                      : null;
                  return (
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
                        {c.min_subtotal_pkr ? (
                          <p className="text-[11px] text-coffee-400">
                            min {formatPkr(c.min_subtotal_pkr)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold tabular-nums text-coffee-800">
                          {c.uses_count}
                          {c.max_uses != null && (
                            <span className="font-normal text-coffee-400">
                              {" "}
                              / {c.max_uses}
                            </span>
                          )}
                        </p>
                        {usagePct != null && (
                          <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-cream-100">
                            <div
                              className="h-full bg-coffee-700"
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        )}
                        {c.max_uses == null && (
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-coffee-400">
                            Unlimited
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-matcha-700">
                        {c.stats.total_saved_pkr > 0
                          ? formatPkr(c.stats.total_saved_pkr)
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-coffee-800">
                        {c.stats.total_revenue_pkr > 0
                          ? formatPkr(c.stats.total_revenue_pkr)
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-coffee-500">
                        {c.stats.last_used_at
                          ? formatDate(c.stats.last_used_at)
                          : "Never"}
                        {c.expires_at && (
                          <p className="text-[10px] text-coffee-400">
                            Expires {formatDate(c.expires_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                            (STATUS_TONE[c.effective_status] ??
                              "bg-coffee-100 text-coffee-600")
                          }
                        >
                          {STATUS_LABEL[c.effective_status] ?? c.effective_status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  hint,
  hintEnd,
}: {
  label: string;
  value: string;
  hint?: string;
  hintEnd?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_-22px_rgba(66,41,26,0.2)] ring-1 ring-coffee-100">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
        {label}
      </p>
      <p className="mt-1 truncate font-display text-xl tabular-nums text-coffee-800 sm:text-2xl">
        {value}
      </p>
      {(hint || hintEnd) && (
        <p className="mt-0.5 text-[11px] text-coffee-500">
          {hint}
          {hintEnd && <span className="font-semibold text-coffee-700">{hintEnd}</span>}
        </p>
      )}
    </div>
  );
}
