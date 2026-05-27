import { NextResponse, type NextRequest } from "next/server";
import { listDealsWithStats } from "@/lib/admin/promo-stats";

export const runtime = "nodejs";

/**
 * CSV export of /admin/deals matching the same status + q filters.
 * Auth is enforced inside `listDealsWithStats` → `requireAdmin()`.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const statusFilter = (url.searchParams.get("status") ?? "all") as
    | "all"
    | "active"
    | "scheduled"
    | "ended"
    | "paused";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const all = await listDealsWithStats();
  const rowsData = all.filter((d) => {
    if (statusFilter !== "all" && d.effective_status !== statusFilter) return false;
    if (q) {
      const hit =
        d.title.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q) ||
        (d.target_slug ?? "").toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  const headers = [
    "Title",
    "Description",
    "Discount type",
    "Discount value",
    "Applies to",
    "Target slug",
    "Starts at (ISO)",
    "Ends at (ISO)",
    "Status",
    "Orders touched",
    "Discounted lines",
    "Customer saved PKR",
    "Revenue PKR",
    "First used (ISO)",
    "Last used (ISO)",
    "Created at (ISO)",
  ];

  const rows = rowsData.map((d) => [
    d.title,
    d.description ?? "",
    d.discount_type,
    String(d.discount_value),
    d.applies_to,
    d.target_slug ?? "",
    d.starts_at ?? "",
    d.ends_at ?? "",
    d.effective_status,
    String(d.stats.orders_count),
    String(d.stats.lines_count),
    String(d.stats.total_saved_pkr),
    String(d.stats.total_revenue_pkr),
    d.stats.first_used_at ?? "",
    d.stats.last_used_at ?? "",
    d.created_at ?? "",
  ]);

  const csv = toCsv([headers, ...rows]);
  const filename = `meseta-deals-${stamp()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function toCsv(rows: (string | number)[][]): string {
  return (
    "﻿" +
    rows
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? "");
            const needsQuote = /[",\r\n]/.test(s);
            const escaped = s.replace(/"/g, '""');
            return needsQuote ? `"${escaped}"` : escaped;
          })
          .join(","),
      )
      .join("\r\n")
  );
}

function stamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
