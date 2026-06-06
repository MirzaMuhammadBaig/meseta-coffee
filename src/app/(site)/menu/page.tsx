import type { Metadata } from "next";
import { ChefHat, Receipt, Leaf } from "lucide-react";
import CtaBanner from "@/components/CtaBanner";
import MenuExplorer from "@/components/menu/MenuExplorer";
import BranchBanner from "@/components/branch/BranchBanner";
import { getPublicMenu } from "@/lib/data/menu";
import { getActiveDeals } from "@/lib/data/deals-public";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Signature lattes, ceremonial matcha, cold brew, hand-pressed sandwiches and bakery. See the full Meseta Coffee menu.",
};

const menuNotes = [
  {
    icon: ChefHat,
    title: "Made to order",
    body: "Every drink and plate is prepared fresh when you order it.",
  },
  {
    icon: Receipt,
    title: "Tax included",
    body: "All prices are in PKR and inclusive of tax. No hidden fees.",
  },
  {
    icon: Leaf,
    title: "Allergens? Just ask",
    body: "Tell our team about any allergies and we will guide you through the menu.",
  },
];

export default async function MenuPage() {
  const [{ items, categories }, deals] = await Promise.all([
    getPublicMenu(),
    getActiveDeals(),
  ]);
  return (
    <>
      {/* Products surface immediately. Search + category chips live inside MenuExplorer. */}
      <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-28 lg:pt-10">
        <div className="container-base">
          {/* Confirms which branch the order will go to, with a one-tap
              switch. Renders nothing when there is only one branch. */}
          <BranchBanner variant="card" />
          <div className="mt-8 sm:mt-10">
            <MenuExplorer
              items={items}
              categories={categories}
              deals={deals}
            />
          </div>
        </div>
      </section>

      {/* Menu notes (used to live in the page header) */}
      <section className="bg-cream-100/40 py-14 sm:py-16">
        <div className="container-base">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-3 font-display text-2xl text-coffee-800 sm:text-3xl">
              The Meseta menu, in three quick notes.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {menuNotes.map((n) => (
              <div
                key={n.title}
                className="card-interactive group flex h-full flex-col items-start p-6"
              >
                <div className="rounded-2xl bg-gold-500/15 p-3 text-gold-600 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-gold-500/30 group-hover:text-gold-500">
                  <n.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="mt-4 font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900">
                  {n.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-coffee-500">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
