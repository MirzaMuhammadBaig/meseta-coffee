"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import AddToOrderButton from "@/components/cart/AddToOrderButton";
import SafeImage from "@/components/SafeImage";
import type { MenuItem } from "@/lib/data/menu";
import { cn, formatPkr } from "@/lib/utils";

type Category = {
  slug: string;
  name: string;
  description: string;
};

type Props = {
  items: MenuItem[];
  categories: Category[];
};

/** Strip diacritics + lowercase so accent-insensitive search works (e.g. "cafe" matches "café"). */
function normalize(s: string) {
  // ̀-ͯ is the Unicode "Combining Diacritical Marks" block.
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Escape regex metacharacters in a user-typed token. */
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function MenuExplorer({ items, categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── URL sync ───────────────────────────────────────────────
  // Read ?q= once on mount, then keep URL in sync (debounced) so the
  // user can share or bookmark a filtered view, and back/forward works.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQ = params.get("q") ?? "";
    const initialC = params.get("c");
    if (initialQ) setQuery(initialQ);
    if (initialC) setActiveCategory(initialC);

    const onPop = () => {
      const p = new URLSearchParams(window.location.search);
      setQuery(p.get("q") ?? "");
      setActiveCategory(p.get("c"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Write back to the URL (debounced) without scroll/navigation.
  useEffect(() => {
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");
      if (activeCategory) url.searchParams.set("c", activeCategory);
      else url.searchParams.delete("c");
      window.history.replaceState({}, "", url);
    }, 200);
    return () => clearTimeout(t);
  }, [query, activeCategory]);

  // ─── Keyboard shortcuts ────────────────────────────────────
  // "/" focuses the search input (skipped while typing in another field).
  // Escape inside the input clears + blurs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (query) {
          setQuery("");
        } else {
          inputRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [query]);

  // ─── Filtering ─────────────────────────────────────────────
  const categoryNameBySlug = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of categories) m[c.slug] = c.name;
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    const tokens = trimmed ? normalize(trimmed).split(/\s+/).filter(Boolean) : [];

    return items.filter((item) => {
      if (activeCategory && item.category !== activeCategory) return false;
      if (tokens.length === 0) return true;

      const haystack = normalize(
        [
          item.name,
          item.description,
          categoryNameBySlug[item.category] ?? "",
          (item.tags ?? []).join(" "),
        ].join(" "),
      );
      return tokens.every((t) => haystack.includes(t));
    });
  }, [items, query, activeCategory, categoryNameBySlug]);

  const grouped = useMemo(
    () =>
      categories
        .map((c) => ({
          category: c,
          items: filtered.filter((i) => i.category === c.slug),
        }))
        .filter((g) => g.items.length > 0),
    [filtered, categories],
  );

  const isFiltering = query.trim().length > 0 || activeCategory !== null;
  const totalCount = filtered.length;

  const clearAll = useCallback(() => {
    setQuery("");
    setActiveCategory(null);
  }, []);

  return (
    <div>
      {/* ─── Sticky search + chips ─────────────────────────── */}
      <div className="sticky top-16 z-30 -mx-4 mb-10 border-b border-coffee-100/60 bg-cream-50/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="relative max-w-2xl">
          <Search
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
              query ? "text-coffee-700" : "text-coffee-400",
            )}
            strokeWidth={2}
          />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            role="searchbox"
            spellCheck={false}
            autoComplete="off"
            aria-label="Search the menu"
            aria-controls="menu-results"
            placeholder="Search drinks, sandwiches, brownies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full appearance-none rounded-full border border-coffee-100 bg-white py-3 pl-11 pr-24 text-sm text-coffee-800 shadow-[0_10px_30px_-20px_rgba(66,41,26,0.45)] placeholder:text-coffee-300 transition-all duration-200 focus:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold-400/40 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-coffee-500 transition-colors duration-200 hover:bg-coffee-100 hover:text-coffee-800 active:scale-90"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-coffee-200 bg-cream-100 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-coffee-500 sm:block"
            >
              /
            </kbd>
          )}
        </div>

        {/* Category chips */}
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          >
            All
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.slug}
              active={activeCategory === c.slug}
              onClick={() =>
                setActiveCategory((curr) => (curr === c.slug ? null : c.slug))
              }
            >
              {c.name}
            </Chip>
          ))}
        </div>

        {/* Live region for screen readers + small count indicator */}
        <p
          className={cn(
            "mt-2 text-xs text-coffee-500 transition-opacity duration-200",
            isFiltering ? "opacity-100" : "h-0 overflow-hidden opacity-0",
          )}
          aria-live="polite"
        >
          {totalCount === 0 ? (
            <>No items match your filters.</>
          ) : (
            <>
              Showing <span className="font-semibold text-coffee-700">{totalCount}</span>{" "}
              {totalCount === 1 ? "item" : "items"}
              {query.trim() && (
                <>
                  {" "}
                  for <span className="font-semibold text-coffee-700">"{query.trim()}"</span>
                </>
              )}
              {activeCategory && (
                <>
                  {" "}
                  in{" "}
                  <span className="font-semibold text-coffee-700">
                    {categoryNameBySlug[activeCategory]}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-coffee-500 hover:text-coffee-800"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Reset
              </button>
            </>
          )}
        </p>
      </div>

      {/* ─── Results ──────────────────────────────────────── */}
      <div id="menu-results">
        {totalCount === 0 ? (
          <div className="card mx-auto max-w-md p-8 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-coffee-400">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-2xl text-coffee-800">
              No matches found.
            </h3>
            <p className="mt-2 text-sm text-coffee-500">
              Try a different word, like{" "}
              <button
                type="button"
                onClick={() => setQuery("matcha")}
                className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
              >
                matcha
              </button>
              ,{" "}
              <button
                type="button"
                onClick={() => setQuery("cold brew")}
                className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
              >
                cold brew
              </button>{" "}
              or{" "}
              <button
                type="button"
                onClick={() => setQuery("sandwich")}
                className="font-semibold text-coffee-700 underline-offset-4 hover:underline"
              >
                sandwich
              </button>
              .
            </p>
            <button type="button" onClick={clearAll} className="btn-ghost mt-6">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-16 sm:space-y-20 lg:space-y-24">
            {grouped.map(({ category, items: catItems }) => (
              <div
                key={category.slug}
                id={category.slug}
                className="scroll-mt-32"
              >
                <div className="flex flex-col gap-3 border-b border-coffee-100 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                  <div>
                    <p className="eyebrow">{category.name}</p>
                    <h2 className="mt-3 font-display text-3xl text-coffee-800 sm:text-4xl">
                      {category.name}
                    </h2>
                  </div>
                  <p className="max-w-md text-sm text-coffee-500 sm:text-right">
                    {category.description}
                  </p>
                </div>

                <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {catItems.map((item) => (
                    <MenuCard key={item.slug} item={item} highlight={query} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 ease-out active:scale-95",
        active
          ? "border-coffee-700 bg-coffee-700 text-cream-50 shadow-[0_8px_20px_-10px_rgba(46,27,16,0.55)]"
          : "border-coffee-100 bg-white text-coffee-500 hover:border-coffee-300 hover:text-coffee-800",
      )}
    >
      {children}
    </button>
  );
}

function MenuCard({ item, highlight }: { item: MenuItem; highlight?: string }) {
  return (
    <article className="card-interactive group flex flex-col overflow-hidden">
      <Link
        href={`/menu/${item.slug}`}
        aria-label={`View ${item.name}`}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
      >
        <div className="relative h-44 w-full overflow-hidden sm:h-48">
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            fallbackContent={
              <div className="flex h-full w-full items-center justify-center bg-cream-100 font-display text-4xl text-coffee-300 transition-colors duration-300 group-hover:bg-cream-200">
                {item.name.charAt(0)}
              </div>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {item.bestseller && (
            <span className="absolute left-4 top-4 rounded-full bg-coffee-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
              Bestseller
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg text-coffee-800 transition-colors duration-300 group-hover:text-coffee-900 sm:text-xl">
              <Highlight text={item.name} term={highlight} />
            </h3>
            <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-coffee-700 transition-colors duration-300 group-hover:text-gold-600 sm:text-base">
              {formatPkr(item.price)}
            </span>
          </div>
          <p className="mt-2 text-sm text-coffee-500">
            <Highlight text={item.description} term={highlight} />
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-coffee-500 transition-colors duration-200 group-hover:bg-cream-200 group-hover:text-coffee-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-coffee-100 px-5 py-4 sm:px-6">
        <Link
          href={`/menu/${item.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-coffee-500 transition-colors duration-200 hover:text-coffee-800"
        >
          View details →
        </Link>
        <AddToOrderButton
          slug={item.slug}
          name={item.name}
          price={item.price}
        />
      </div>
    </article>
  );
}

/** Wrap any matching tokens in <mark> for visual hit-highlighting. */
function Highlight({ text, term }: { text: string; term?: string }) {
  const trimmed = term?.trim() ?? "";
  if (!trimmed) return <>{text}</>;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;

  const pattern = tokens.map(escapeRegex).join("|");
  const re = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(re);
  const lowerTokens = new Set(tokens.map((t) => t.toLowerCase()));

  return (
    <>
      {parts.map((part, i) =>
        lowerTokens.has(part.toLowerCase()) ? (
          <mark
            key={i}
            className="rounded bg-gold-500/25 px-0.5 text-coffee-900"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
