import Link from "next/link";
import Image from "next/image";
import { EyeOff, Plus, Power, PowerOff } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import {
  listMenuItems,
  setAllMenuItemsDisabled,
  toggleMenuItemDisabled,
} from "@/lib/admin/menu";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  const items = await listMenuItems();
  const enabledCount = items.filter((i) => !i.is_disabled).length;

  async function disableAll() {
    "use server";
    await setAllMenuItemsDisabled(true);
  }
  async function enableAll() {
    "use server";
    await setAllMenuItemsDisabled(false);
  }
  async function toggleOne(id: string, next: boolean) {
    "use server";
    await toggleMenuItemDisabled(id, next);
  }

  return (
    <>
      <PageHeading
        eyebrow="Catalog"
        title="Menu"
        description="Add, edit, hide or remove items. Changes appear on the public site immediately."
        actions={
          <>
            <form action={disableAll}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-50"
              >
                <PowerOff className="h-3.5 w-3.5" /> Disable all
              </button>
            </form>
            <form action={enableAll}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-matcha-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-matcha-700 transition hover:bg-matcha-500/10"
              >
                <Power className="h-3.5 w-3.5" /> Enable all
              </button>
            </form>
            <Link
              href="/admin/menu/new"
              className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 transition hover:bg-coffee-800"
            >
              <Plus className="h-3.5 w-3.5" /> New item
            </Link>
          </>
        }
      />

      <p className="mb-5 text-xs text-coffee-500">
        <span className="font-semibold text-coffee-700">{enabledCount}</span>{" "}
        of {items.length} items are live.
      </p>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-cream-100/60 text-left text-[10px] uppercase tracking-[0.2em] text-coffee-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Flags</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coffee-100">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-coffee-500"
                >
                  No menu items yet.{" "}
                  <Link
                    href="/admin/menu/new"
                    className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
                  >
                    Create the first one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-100/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center font-display text-base text-coffee-300">
                            {item.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/menu/${item.id}`}
                          className="block font-semibold text-coffee-800 hover:text-gold-600"
                        >
                          {item.name}
                        </Link>
                        <p className="truncate text-xs text-coffee-400">
                          /{item.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-coffee-600">
                    {item.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold tabular-nums text-coffee-800">
                    {formatPkr(item.price_pkr)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.is_bestseller && (
                        <span className="rounded-full bg-coffee-700/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-700">
                          Best
                        </span>
                      )}
                      {item.is_signature && (
                        <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-700">
                          Sig
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {item.is_disabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-700">
                        <EyeOff className="h-3 w-3" /> Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-matcha-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-matcha-700">
                        Live
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={toggleOne.bind(null, item.id, !item.is_disabled)}>
                      <button
                        type="submit"
                        className="text-xs font-semibold uppercase tracking-[0.16em] text-coffee-500 hover:text-coffee-800"
                      >
                        {item.is_disabled ? "Enable" : "Disable"}
                      </button>
                    </form>
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
