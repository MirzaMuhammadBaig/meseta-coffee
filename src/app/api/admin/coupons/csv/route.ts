import { NextResponse, type NextRequest } from "next/server";
import { listCouponsWithStats } from "@/lib/admin/promo-stats";

export const runtime = "nodejs";

/**
 * CSV export of /admin/coupons matching the same status + q filters.
 * Auth is enforced inside `listCouponsWithStats` → `requireAdmin()`.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const statusFilter = (url.searchParams.get("status") ?? "all") as
    | "all"
    | "active"
    | "exhausted"
    | "expired"
    | "inactive";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const all = await listCouponsWithStats();
  const rowsData = all.filter((c) => {
    if (statusFilter !== "all" && c.effective_status !== statusFilter) return false;
    if (q) {
      const hit =
        c.code.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  const headers = [
    "Code",
    "Description",
    "Discount type",
    "Discount value",
    "Min subtotal PKR",
    "Uses",
    "Max uses",
    "Expires at (ISO)",
    "Status",
    "Orders",
    "Customer saved PKR",
    "Revenue PKR",
    "Avg order value PKR",
    "First used (ISO)",
    "Last used (ISO)",
    "Created at (ISO)",
  ];

  const rows = rowsData.map((c) => [
    c.code,
    c.description ?? "",
    c.discount_type,
    String(c.discount_value),
    c.min_subtotal_pkr != null ? String(c.min_subtotal_pkr) : "",
    String(c.uses_count),
    c.max_uses != null ? String(c.max_uses) : "",
    c.expires_at ?? "",
    c.effective_status,
    String(c.stats.orders_count),
    String(c.stats.total_saved_pkr),
    String(c.stats.total_revenue_pkr),
    String(c.stats.avg_order_value_pkr),
    c.stats.first_used_at ?? "",
    c.stats.last_used_at ?? "",
    c.created_at ?? "",
  ]);

  const csv = toCsv([headers, ...rows]);
  const filename = `meseta-coupons-${stamp()}.csv`;

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
