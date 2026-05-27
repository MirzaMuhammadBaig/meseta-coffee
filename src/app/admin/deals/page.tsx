import Link from "next/link";
import { BarChart3, Download, Plus, Search } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { listDealsWithStats } from "@/lib/admin/promo-stats";
import { formatDate, formatPkr } from "@/lib/utils";

export const metadata = { title: "Deals" };

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "ended", label: "Ended" },
  { value: "paused", label: "Paused" },
] as const;

const STATUS_TONE: Record<string, string> = {
  active: "bg-matcha-500/15 text-matcha-700",
  scheduled: "bg-gold-500/15 text-gold-700",
  ended: "bg-coffee-100 text-coffee-600",
  paused: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  scheduled: "Scheduled",
  ended: "Ended",
  paused: "Paused",
};

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const statusFilter = (searchParams.status ?? "all") as
    | "all"
    | "active"
    | "scheduled"
    | "ended"
    | "paused";
  const q = (searchParams.q ?? "").trim();

  const all = await listDealsWithStats();
  const filtered = all.filter((d) => {
    if (statusFilter !== "all" && d.effective_status !== statusFilter)
      return false;
    if (q) {
      const term = q.toLowerCase();
      const hit =
        d.title.toLowerCase().includes(term) ||
        (d.description ?? "").toLowerCase().includes(term) ||
        (d.target_slug ?? "").toLowerCase().includes(term);
      if (!hit) return false;
    }
    return true;
  });

  const totalSaved = filtered.reduce((s, d) => s + d.stats.total_saved_pkr, 0);
  const totalRevenue = filtered.reduce(
    (s, d) => s + d.stats.total_revenue_pkr,
    0,
  );
  const totalOrders = filtered.reduce((s, d) => s + d.stats.orders_count, 0);
  const activeCount = all.filter((d) => d.effective_status === "active").length;

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);

  const csvHref = `/api/admin/deals/csv?${(() => {
    const sp = new URLSearchParams(baseParams);
    if (statusFilter !== "all") sp.set("status", statusFilter);
    return sp.toString();
  })()}`;

  return (
    <>
      <PageHeading
        eyebrow="Promotions"
        title="Deals"
        description="Scheduled promotions shown on the menu. Tap any deal for stats + the orders it discounted."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={csvHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-coffee-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-coffee-600 transition hover:border-coffee-300 hover:text-coffee-800"
            >
              <Download className="h-3 w-3" /> Export CSV
            </a>
            <Link
              href="/admin/deals/new"
              className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-coffee-800"
            >
              <Plus className="h-3.5 w-3.5" /> New deal
            </Link>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Active deals" value={String(activeCount)} hint="of " hintEnd={`${all.length} total`} />
        <Kpi label="Orders touched" value={totalOrders.toLocaleString()} hint="in view" />
        <Kpi label="Customer saved" value={formatPkr(totalSaved)} hint="across this view" />
        <Kpi label="Revenue" value={formatPkr(totalRevenue)} hint="from deal orders" />
      </div>

      <form className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title, description or item slug"
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
              href={`/admin/deals?${sp.toString()}`}
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
        deal{filtered.length === 1 ? "" : "s"} shown
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
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Deal</th>
                <th className="px-5 py-3 font-semibold">Discount</th>
                <th className="px-5 py-3 font-semibold">Applies to</th>
                <th className="px-5 py-3 font-semibold">Window</th>
                <th className="px-5 py-3 text-right font-semibold">Orders</th>
                <th className="px-5 py-3 text-right font-semibold">Customer saved</th>
                <th className="px-5 py-3 text-right font-semibold">Revenue</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-coffee-500">
                    No deals match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
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
                        <p className="mt-0.5 max-w-md truncate text-xs text-coffee-400">
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
                      <br />
                      <span className="text-coffee-400">→ {d.ends_at ? formatDate(d.ends_at) : "no end"}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-coffee-800">
                      {d.stats.orders_count > 0 ? d.stats.orders_count : "—"}
                      {d.stats.lines_count > 0 && (
                        <p className="text-[10px] font-normal text-coffee-400">
                          {d.stats.lines_count} line
                          {d.stats.lines_count === 1 ? "" : "s"}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-matcha-700">
                      {d.stats.total_saved_pkr > 0
                        ? formatPkr(d.stats.total_saved_pkr)
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-coffee-800">
                      {d.stats.total_revenue_pkr > 0
                        ? formatPkr(d.stats.total_revenue_pkr)
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                          (STATUS_TONE[d.effective_status] ??
                            "bg-coffee-100 text-coffee-600")
                        }
                      >
                        {STATUS_LABEL[d.effective_status] ?? d.effective_status}
                      </span>
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
