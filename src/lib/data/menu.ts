export type MenuItem = {
  slug: string;
  name: string;
  description: string;
  price: number; // PKR
  category: MenuCategorySlug;
  image?: string;
  bestseller?: boolean;
  signature?: boolean;
  tags?: string[];
};

export type MenuCategorySlug =
  | "signature"
  | "espresso"
  | "matcha"
  | "cold-brew"
  | "sandwiches"
  | "bakery";

export const menuCategories: {
  slug: MenuCategorySlug;
  name: string;
  description: string;
}[] = [
  {
    slug: "signature",
    name: "Signature Drinks",
    description: "Meseta originals you won't find anywhere else.",
  },
  {
    slug: "espresso",
    name: "Espresso Bar",
    description: "Classic espresso-based drinks pulled on our La Marzocco.",
  },
  {
    slug: "matcha",
    name: "Matcha & Tea",
    description: "Ceremonial-grade matcha, lattes and seasonal teas.",
  },
  {
    slug: "cold-brew",
    name: "Cold Brew & Iced",
    description: "24-hour cold-brewed and ice-shaken refreshers.",
  },
  {
    slug: "sandwiches",
    name: "Sandwiches",
    description: "House-pressed sandwiches on artisan bread.",
  },
  {
    slug: "bakery",
    name: "Bakery & Desserts",
    description: "Baked in-house every morning.",
  },
];

export const menu: MenuItem[] = [
  {
    slug: "meseta-layered-latte",
    name: "Meseta Layered Latte",
    description:
      "Our signature triple-layered latte with espresso, steamed milk and a cocoa-dust finish.",
    price: 950,
    category: "signature",
    bestseller: true,
    signature: true,
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "turkish-matcha",
    name: "Turkish Matcha",
    description:
      "Whisked ceremonial matcha layered with rose syrup and frothed milk.",
    price: 1050,
    category: "signature",
    bestseller: true,
    signature: true,
    image:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "spanish-latte",
    name: "Spanish Latte",
    description: "Double espresso, condensed milk, steamed whole milk.",
    price: 900,
    category: "signature",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "cappuccino",
    name: "Cappuccino",
    description:
      "Velvety microfoam over a double shot of single-origin espresso.",
    price: 750,
    category: "espresso",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "flat-white",
    name: "Flat White",
    description: "Ristretto pulled shots, silky steamed milk, no foam.",
    price: 800,
    category: "espresso",
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "caramel-macchiato",
    name: "Caramel Macchiato",
    description: "Espresso, vanilla, steamed milk, finished with house caramel.",
    price: 900,
    category: "espresso",
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "americano",
    name: "Americano",
    description: "A double shot, hot water, served black.",
    price: 600,
    category: "espresso",
  },
  {
    slug: "matcha-latte",
    name: "Matcha Latte",
    description: "Ceremonial matcha whisked with steamed milk, hot or iced.",
    price: 950,
    category: "matcha",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "strawberry-matcha",
    name: "Strawberry Matcha",
    description: "Fresh strawberry purée, matcha and cold milk over ice.",
    price: 1100,
    category: "matcha",
    image:
      "https://images.unsplash.com/photo-1620207418302-439b387441b0?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "iced-jasmine",
    name: "Iced Jasmine Tea",
    description: "Cold-brewed jasmine pearls, honey, and a slice of lemon.",
    price: 650,
    category: "matcha",
  },
  {
    slug: "classic-cold-brew",
    name: "Classic Cold Brew",
    description:
      "Steeped for 24 hours, served straight over ice. Smooth, low-acid.",
    price: 850,
    category: "cold-brew",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "vanilla-sweet-cream",
    name: "Vanilla Sweet-Cream Cold Brew",
    description: "Cold brew topped with vanilla sweet cream cascade.",
    price: 950,
    category: "cold-brew",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "chipotle-chicken",
    name: "Chipotle Chicken Sandwich",
    description:
      "Grilled chicken, smoky chipotle aioli, pickled onion on house ciabatta.",
    price: 1250,
    category: "sandwiches",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "truffle-mushroom",
    name: "Truffle Mushroom Melt",
    description: "Sauteed mushrooms, mozzarella and truffle oil on sourdough.",
    price: 1350,
    category: "sandwiches",
    tags: ["vegetarian"],
    image:
      "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "pesto-turkey",
    name: "Pesto Turkey Press",
    description: "Roast turkey, basil pesto, sun-dried tomato and mozzarella.",
    price: 1300,
    category: "sandwiches",
  },
  {
    slug: "walnut-fudge-brownie",
    name: "Walnut Fudge Brownie",
    description:
      "Rich, moist, and packed with toasted walnuts. Guests order it twice.",
    price: 550,
    category: "bakery",
    bestseller: true,
    image:
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "tiramisu",
    name: "Classic Tiramisu",
    description: "Mascarpone, espresso-soaked ladyfingers, cocoa.",
    price: 650,
    category: "bakery",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "almond-croissant",
    name: "Almond Croissant",
    description: "Twice-baked croissant, almond cream, flaked almonds.",
    price: 500,
    category: "bakery",
  },
];

export const bestsellers = menu.filter((m) => m.bestseller);
export const signatures = menu.filter((m) => m.signature);

// ─── Live menu (Supabase-first, static fallback) ──────────────
// Lets the admin's CRUD changes appear on the public site immediately
// without having to maintain two sources of truth.

import { createSupabaseServerClient } from "@/lib/supabase/server";

type DbItem = {
  slug: string;
  name: string;
  description: string | null;
  price_pkr: number;
  image_url: string | null;
  is_bestseller: boolean;
  is_signature: boolean;
  is_disabled: boolean;
  tags: string[] | null;
  sort_order: number;
  category: { slug: string; name: string } | null;
};

function dbToMenuItem(r: DbItem): MenuItem {
  return {
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    price: r.price_pkr,
    category: (r.category?.slug ?? "signature") as MenuCategorySlug,
    image: r.image_url ?? undefined,
    bestseller: r.is_bestseller,
    signature: r.is_signature,
    tags: r.tags ?? [],
  };
}

/**
 * Returns the catalog as the public site should see it right now:
 * only items where is_disabled = false. Falls back to the static seed
 * if Supabase is unreachable or empty, so the marketing site never
 * breaks during local dev.
 */
export async function getPublicMenu(): Promise<{
  items: MenuItem[];
  categories: typeof menuCategories;
}> {
  try {
    const supabase = createSupabaseServerClient();
    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select(
          "slug, name, description, price_pkr, image_url, is_bestseller, is_signature, is_disabled, tags, sort_order, category:menu_categories(slug, name)",
        )
        .eq("is_disabled", false)
        .order("sort_order"),
      supabase
        .from("menu_categories")
        .select("slug, name, description, sort_order")
        .order("sort_order"),
    ]);

    const rows = (itemsRes.data as unknown as DbItem[]) ?? [];
    if (rows.length === 0) {
      return { items: menu, categories: menuCategories };
    }
    return {
      items: rows.map(dbToMenuItem),
      categories: (catsRes.data as typeof menuCategories) ?? menuCategories,
    };
  } catch {
    return { items: menu, categories: menuCategories };
  }
}

export async function getPublicMenuItem(slug: string): Promise<MenuItem | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("menu_items")
      .select(
        "slug, name, description, price_pkr, image_url, is_bestseller, is_signature, is_disabled, tags, sort_order, category:menu_categories(slug, name)",
      )
      .eq("slug", slug)
      .eq("is_disabled", false)
      .maybeSingle();
    if (data) return dbToMenuItem(data as unknown as DbItem);
  } catch {
    // fall through to static
  }
  return menu.find((m) => m.slug === slug) ?? null;
}

/** Default hero image used when a menu item has no `image` field. */
export const FALLBACK_MENU_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80";

export function getMenuItem(slug: string): MenuItem | undefined {
  return menu.find((m) => m.slug === slug);
}

export function getCategory(slug: MenuCategorySlug) {
  return menuCategories.find((c) => c.slug === slug);
}

/**
 * Up to `limit` other items from the same category (excluding the current one).
 * Falls back to bestsellers from other categories if there aren't enough siblings.
 */
export function getRelatedItems(item: MenuItem, limit = 3): MenuItem[] {
  const sameCategory = menu.filter(
    (m) => m.category === item.category && m.slug !== item.slug,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fillers = menu.filter(
    (m) =>
      m.bestseller &&
      m.slug !== item.slug &&
      !sameCategory.find((s) => s.slug === m.slug),
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}
