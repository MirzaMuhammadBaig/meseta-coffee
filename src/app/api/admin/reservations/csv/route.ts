import { NextResponse, type NextRequest } from "next/server";
import { listReservations } from "@/lib/admin/inbox";
import { getActiveBranches } from "@/lib/data/branches";

export const runtime = "nodejs";

/**
 * CSV export of reservations matching the same filters as the
 * `/admin/reservations` page (status, q, from, to).
 *
 * Auth is enforced by `listReservations` → `requireAdmin()`.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = (url.searchParams.get("status") as
    | "all"
    | "pending"
    | "confirmed"
    | "seated"
    | "cancelled"
    | "no_show") ?? "all";
  const q = url.searchParams.get("q") ?? "";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const branchId = url.searchParams.get("branch") ?? "all";

  const [rows, branches] = await Promise.all([
    listReservations({ status, q, from, to, branchId }),
    getActiveBranches(),
  ]);
  const branchName = new Map(
    branches.map((b) => [b.id, b.short_name ?? b.name]),
  );

  const headers = [
    "Name",
    "Branch",
    "Phone",
    "Email",
    "Party size",
    "Reserved for (ISO)",
    "Ends at (ISO)",
    "Status",
    "Notes",
    "Created at (ISO)",
  ];

  const data = rows.map((r) => [
    r.name,
    r.branch_id ? branchName.get(r.branch_id) ?? "" : "",
    r.phone,
    r.email ?? "",
    String(r.party_size),
    r.reserved_for,
    r.ends_at ?? "",
    r.status,
    r.notes ?? "",
    r.created_at,
  ]);

  const csv = toCsv([headers, ...data]);
  const filename = `meseta-reservations-${stamp()}.csv`;

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
