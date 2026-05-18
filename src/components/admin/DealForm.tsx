import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import type { Deal } from "@/lib/admin/deals";

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export default function DealForm({
  deal,
  onSave,
  onDelete,
}: {
  deal?: Deal;
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
          <h2 className="font-display text-xl text-coffee-800">Deal</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Title
              </label>
              <input
                name="title"
                required
                defaultValue={deal?.title ?? ""}
                placeholder="Matcha Monday"
                className="input mt-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Slug
              </label>
              <input
                name="slug"
                defaultValue={deal?.slug ?? ""}
                placeholder="auto-from-title"
                className="input mt-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                defaultValue={deal?.image_url ?? ""}
                placeholder="https://…"
                className="input mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={deal?.description ?? ""}
                className="input mt-2 resize-none"
                placeholder="20% off every matcha drink, every Monday."
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Discount</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Type
              </label>
              <select
                name="discount_type"
                defaultValue={deal?.discount_type ?? "percentage"}
                className="input mt-2"
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed PKR off</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Value
              </label>
              <input
                type="number"
                name="discount_value"
                required
                min={0}
                defaultValue={deal?.discount_value ?? 10}
                className="input mt-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Applies to
              </label>
              <select
                name="applies_to"
                defaultValue={deal?.applies_to ?? "all"}
                className="input mt-2"
              >
                <option value="all">Entire menu</option>
                <option value="category">A category</option>
                <option value="item">A single item</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Target slug
              </label>
              <input
                name="target_slug"
                defaultValue={deal?.target_slug ?? ""}
                placeholder="e.g. matcha or turkish-matcha"
                className="input mt-2 font-mono text-xs"
              />
              <p className="mt-1.5 text-[11px] text-coffee-400">
                Leave blank if "applies to" is the whole menu.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Schedule</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Starts
              </label>
              <input
                type="datetime-local"
                name="starts_at"
                defaultValue={toDateInput(deal?.starts_at ?? null)}
                className="input mt-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Ends
              </label>
              <input
                type="datetime-local"
                name="ends_at"
                defaultValue={toDateInput(deal?.ends_at ?? null)}
                className="input mt-2"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-coffee-400">
            Both optional — leave blank for "always-on" deals.
          </p>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={deal ? deal.is_active : true}
              className="h-4 w-4 rounded border-coffee-200 text-coffee-700"
            />
            <span className="text-sm font-semibold text-coffee-800">
              Active
            </span>
          </label>
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
              Sort order
            </label>
            <input
              type="number"
              name="sort_order"
              defaultValue={deal?.sort_order ?? 0}
              className="input mt-2"
            />
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition hover:bg-coffee-800"
          >
            <Save className="h-4 w-4" /> Save deal
          </button>
          {onDelete && (
            <form action={onDelete}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete deal
              </button>
            </form>
          )}
          <Link
            href="/admin/deals"
            className="text-center text-xs uppercase tracking-[0.2em] text-coffee-500 hover:text-coffee-800"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
