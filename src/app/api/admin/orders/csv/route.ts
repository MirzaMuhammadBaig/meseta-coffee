import { NextResponse, type NextRequest } from "next/server";
import { listOrders } from "@/lib/admin/orders";
import { getActiveBranches } from "@/lib/data/branches";
import type { OrderStatus } from "@/lib/admin/order-types";

export const runtime = "nodejs";

/**
 * CSV export of the orders table matching the same filters as the
 * `/admin/orders` page (status, q, from, to).
 *
 * Auth is enforced by `listOrders` → `requireAdmin()` so unauthenticated
 * requests get a redirect to /admin/login instead of a CSV.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = (url.searchParams.get("status") as OrderStatus | "all") ?? "all";
  const q = url.searchParams.get("q") ?? "";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const branchId = url.searchParams.get("branch") ?? "all";

  const [orders, branches] = await Promise.all([
    listOrders({ status, q, from, to, branchId }),
    getActiveBranches(),
  ]);
  const branchName = new Map(
    branches.map((b) => [b.id, b.short_name ?? b.name]),
  );

  const headers = [
    "Order number",
    "Branch",
    "Created at (ISO)",
    "Customer name",
    "Phone",
    "Email",
    "Fulfilment",
    "Address",
    "Items (qty x name)",
    "Subtotal PKR",
    "Discount PKR",
    "Total PKR",
    "Payment method",
    "Payment status",
    "Order status",
    "Notes",
    "Coupon code",
  ];

  const rows = orders.map((o) => [
    o.number,
    o.branch_id ? branchName.get(o.branch_id) ?? "" : "",
    o.created_at,
    o.customer_name,
    o.customer_phone,
    o.customer_email ?? "",
    o.fulfilment,
    o.address ?? "",
    o.items.map((i) => `${i.qty}x ${i.name}`).join("; "),
    String(o.subtotal_pkr),
    String(o.discount_pkr),
    String(o.total_pkr),
    o.payment_method,
    o.payment_status,
    o.status,
    o.notes ?? "",
    o.coupon_code ?? "",
  ]);

  const csv = toCsv([headers, ...rows]);
  const filename = `meseta-orders-${stamp()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** RFC 4180-ish CSV: double-quote fields, escape inner quotes, CRLF line ends. */
function toCsv(rows: (string | number)[][]): string {
  // Excel-compatibility: leading BOM so PKR symbols + unicode names render.
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
