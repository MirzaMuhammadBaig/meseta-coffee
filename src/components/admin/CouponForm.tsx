import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import type { Coupon } from "@/lib/admin/coupons";

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export default function CouponForm({
  coupon,
  onSave,
  onDelete,
}: {
  coupon?: Coupon;
  onSave: (fd: FormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  return (
    <form
      action={onSave}
      className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8"
    >
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Code</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Coupon code
              </label>
              <input
                name="code"
                required
                defaultValue={coupon?.code ?? ""}
                placeholder="WELCOME10"
                className="input mt-2 font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Discount type
              </label>
              <select
                name="discount_type"
                defaultValue={coupon?.discount_type ?? "percentage"}
                className="input mt-2"
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed PKR off</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Discount value
              </label>
              <input
                type="number"
                name="discount_value"
                required
                min={0}
                defaultValue={coupon?.discount_value ?? 10}
                className="input mt-2"
              />
              <p className="mt-1.5 text-[11px] text-coffee-400">
                Percent (1–100) or PKR amount.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Minimum subtotal (PKR)
              </label>
              <input
                type="number"
                name="min_subtotal_pkr"
                min={0}
                defaultValue={coupon?.min_subtotal_pkr ?? 0}
                className="input mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Description (internal)
              </label>
              <input
                name="description"
                defaultValue={coupon?.description ?? ""}
                className="input mt-2"
                placeholder="Welcome offer for first-time customers"
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Limits</h2>
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
              Max uses
            </label>
            <input
              type="number"
              name="max_uses"
              min={0}
              defaultValue={coupon?.max_uses ?? ""}
              placeholder="Unlimited"
              className="input mt-2"
            />
            {coupon && (
              <p className="mt-1.5 text-[11px] text-coffee-400">
                Used {coupon.uses_count} time
                {coupon.uses_count === 1 ? "" : "s"} so far.
              </p>
            )}
          </div>
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
              Expires
            </label>
            <input
              type="datetime-local"
              name="expires_at"
              defaultValue={toDateInput(coupon?.expires_at ?? null)}
              className="input mt-2"
            />
            <p className="mt-1.5 text-[11px] text-coffee-400">
              Leave blank for no expiry.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={coupon ? coupon.is_active : true}
              className="h-4 w-4 rounded border-coffee-200 text-coffee-700"
            />
            <span className="text-sm font-semibold text-coffee-800">
              Active
            </span>
          </label>
          <p className="mt-2 text-[11px] text-coffee-400">
            Inactive coupons cannot be redeemed at checkout.
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition hover:bg-coffee-800"
          >
            <Save className="h-4 w-4" /> Save coupon
          </button>
          {onDelete && (
            <form action={onDelete}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete coupon
              </button>
            </form>
          )}
          <Link
            href="/admin/coupons"
            className="text-center text-xs uppercase tracking-[0.2em] text-coffee-500 hover:text-coffee-800"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
