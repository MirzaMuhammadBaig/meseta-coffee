import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import type { AdminCategory, AdminMenuItem } from "@/lib/admin/menu";

export default function MenuItemForm({
  item,
  categories,
  onSave,
  onDelete,
}: {
  item?: AdminMenuItem;
  categories: AdminCategory[];
  onSave: (fd: FormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  return (
    <form
      action={onSave}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8"
    >
      {/* Main */}
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Basics</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Name
              </label>
              <input
                name="name"
                required
                defaultValue={item?.name ?? ""}
                className="input mt-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Slug
              </label>
              <input
                name="slug"
                defaultValue={item?.slug ?? ""}
                placeholder="auto-from-name"
                className="input mt-2 font-mono text-xs"
              />
              <p className="mt-1.5 text-[11px] text-coffee-400">
                URL: /menu/<span className="text-coffee-600">{item?.slug ?? "…"}</span>
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Price (PKR)
              </label>
              <input
                type="number"
                name="price_pkr"
                required
                min={0}
                step={50}
                defaultValue={item?.price_pkr ?? 0}
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
                defaultValue={item?.description ?? ""}
                className="input mt-2 resize-none"
                placeholder="Short description shown on the menu card."
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Media</h2>
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              defaultValue={item?.image_url ?? ""}
              placeholder="https://…"
              className="input mt-2"
            />
            <p className="mt-1.5 text-[11px] text-coffee-400">
              Paste any image URL (Unsplash, your CDN, etc.). Aim for ≥ 900px wide.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Tags</h2>
          <input
            name="tags"
            defaultValue={item?.tags?.join(", ") ?? ""}
            className="input mt-3"
            placeholder="iced, vegetarian, gluten-free"
          />
          <p className="mt-1.5 text-[11px] text-coffee-400">
            Comma-separated. Used for filters + search.
          </p>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Category</h2>
          <select
            name="category_id"
            defaultValue={item?.category_id ?? ""}
            className="input mt-3"
          >
            <option value="">— Uncategorised —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
              Sort order
            </label>
            <input
              type="number"
              name="sort_order"
              defaultValue={item?.sort_order ?? 0}
              className="input mt-2"
            />
            <p className="mt-1.5 text-[11px] text-coffee-400">
              Lower numbers appear first inside the category.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Flags</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Checkbox name="is_bestseller" label="Bestseller" defaultChecked={item?.is_bestseller} />
            <Checkbox name="is_signature" label="Signature" defaultChecked={item?.is_signature} />
            <Checkbox
              name="is_disabled"
              label="Hide from public site"
              defaultChecked={item?.is_disabled}
            />
          </div>
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
              Stock (optional)
            </label>
            <input
              type="number"
              name="stock"
              min={0}
              defaultValue={item?.stock ?? ""}
              placeholder="Unlimited"
              className="input mt-2"
            />
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition hover:bg-coffee-800"
          >
            <Save className="h-4 w-4" /> Save item
          </button>

          {onDelete && (
            <form action={onDelete}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete item
              </button>
            </form>
          )}

          <Link
            href="/admin/menu"
            className="text-center text-xs uppercase tracking-[0.2em] text-coffee-500 hover:text-coffee-800"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-cream-100">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-coffee-200 text-coffee-700 focus:ring-gold-400"
      />
      <span className="text-coffee-700">{label}</span>
    </label>
  );
}
