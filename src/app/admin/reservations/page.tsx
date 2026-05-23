import Link from "next/link";
import { Search } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { listReservations, updateReservationStatus } from "@/lib/admin/inbox";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Reservations" };

const STATUSES: { value: "confirmed" | "seated" | "cancelled" | "no_show"; label: string; tone: string }[] = [
  { value: "confirmed", label: "Confirm", tone: "bg-coffee-700 text-cream-50 hover:bg-coffee-800" },
  { value: "seated", label: "Seated", tone: "bg-matcha-600 text-cream-50 hover:bg-matcha-500" },
  { value: "cancelled", label: "Cancel", tone: "border border-red-200 text-red-700 hover:bg-red-50" },
  { value: "no_show", label: "No-show", tone: "border border-coffee-200 text-coffee-600 hover:bg-cream-100" },
];

const FILTERS: { value: "all" | "pending" | "confirmed" | "seated" | "cancelled" | "no_show"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "seated", label: "Seated" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

const STATUS_TONE: Record<string, string> = {
  pending: "bg-gold-500/15 text-gold-700",
  confirmed: "bg-blue-50 text-blue-700",
  seated: "bg-matcha-500/15 text-matcha-700",
  cancelled: "bg-red-50 text-red-700",
  no_show: "bg-coffee-100 text-coffee-600",
};

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status =
    (searchParams.status as
      | "all"
      | "pending"
      | "confirmed"
      | "seated"
      | "cancelled"
      | "no_show") ?? "all";
  const q = searchParams.q ?? "";
  const rows = await listReservations({ status, q });

  async function setStatus(id: string, next: "confirmed" | "seated" | "cancelled" | "no_show") {
    "use server";
    await updateReservationStatus(id, next);
  }

  return (
    <>
      <PageHeading
        eyebrow="Operations"
        title="Reservations"
        description="Confirm, mark seated, cancel, or no-show in one tap."
      />

      <form className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, phone, email or note"
            className="w-full rounded-full border border-coffee-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
          />
        </div>
        {FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <Link
              key={f.value}
              href={`/admin/reservations?status=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Guest</th>
              <th className="px-5 py-3 font-semibold">When</th>
              <th className="px-5 py-3 font-semibold">People</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coffee-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-coffee-500">
                  No reservations yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-cream-100/30">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-coffee-800">{r.name}</p>
                    <p className="text-xs text-coffee-400">
                      {r.phone}
                      {r.email && <> · {r.email}</>}
                    </p>
                    {r.notes && (
                      <p className="mt-1 text-xs italic text-coffee-500">
                        "{r.notes}"
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-coffee-700">
                    {formatDate(r.reserved_for)}
                    <p className="text-xs text-coffee-400">
                      {new Date(r.reserved_for).toLocaleTimeString("en-PK", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {r.ends_at && (
                        <>
                          {" – "}
                          {new Date(r.ends_at).toLocaleTimeString("en-PK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </p>
                  </td>
                  <td className="px-5 py-3 font-semibold tabular-nums text-coffee-800">
                    {r.party_size}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] " +
                        (STATUS_TONE[r.status] ?? "bg-coffee-100 text-coffee-700")
                      }
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5 whitespace-nowrap">
                      {STATUSES.map((s) => (
                        <form key={s.value} action={setStatus.bind(null, r.id, s.value)}>
                          <button
                            type="submit"
                            disabled={r.status === s.value}
                            className={
                              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-40 " +
                              s.tone
                            }
                          >
                            {s.label}
                          </button>
                        </form>
                      ))}
                    </div>
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
