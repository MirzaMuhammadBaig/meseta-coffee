// Pure date helpers for the admin date-range filter.
// Used by both the client component AND the server-side query builders,
// so kept dependency-free — no React, no Supabase, no "use server".
//
// All "dates" in the URL are PKT-day strings (YYYY-MM-DD). The server
// converts them to UTC ISO ranges when building Supabase filters.

export const PKT_TZ = "Asia/Karachi";

// ── PKT day arithmetic ─────────────────────────────────────────

/** Today's date in PKT, format YYYY-MM-DD. */
export function pktToday(): string {
  return pktDateOf(new Date());
}

/** Convert a JS Date to its PKT calendar date (YYYY-MM-DD). */
export function pktDateOf(d: Date): string {
  // en-CA renders as YYYY-MM-DD natively.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PKT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Add days to a YYYY-MM-DD PKT date string. Negative numbers go back. */
export function addDays(date: string, days: number): string {
  // Anchor at PKT noon to avoid any DST-style off-by-one weirdness
  // (Pakistan doesn't observe DST, but noon-anchoring is cheap insurance).
  const anchor = new Date(`${date}T12:00:00+05:00`);
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return pktDateOf(anchor);
}

/** First day of the month for a given PKT YYYY-MM-DD. */
export function firstOfMonth(date: string): string {
  const [y, m] = date.split("-");
  return `${y}-${m}-01`;
}

/** Last day of the previous month for a PKT YYYY-MM-DD. */
export function lastOfPrevMonth(date: string): string {
  return addDays(firstOfMonth(date), -1);
}

/** First day of the previous month for a PKT YYYY-MM-DD. */
export function firstOfPrevMonth(date: string): string {
  return firstOfMonth(lastOfPrevMonth(date));
}

// ── PKT range → UTC ISO for SQL filters ─────────────────────────

/**
 * Convert a PKT YYYY-MM-DD range (inclusive) to UTC ISO strings suitable
 * for `created_at >= fromIso` / `created_at <= toIso` Supabase filters.
 */
export function pktRangeToUtc(
  from?: string | null,
  to?: string | null,
): { fromIso?: string; toIso?: string } {
  return {
    fromIso: from
      ? new Date(`${from}T00:00:00.000+05:00`).toISOString()
      : undefined,
    toIso: to
      ? new Date(`${to}T23:59:59.999+05:00`).toISOString()
      : undefined,
  };
}

// ── Presets ─────────────────────────────────────────────────────

export const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "all", label: "All time" },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]["value"];

/**
 * Compute the (from, to) PKT date strings for a preset.
 * `all` → both null (no filter).
 */
export function presetToRange(
  preset: DatePreset,
): { from: string | null; to: string | null } {
  const t = pktToday();
  switch (preset) {
    case "today":
      return { from: t, to: t };
    case "yesterday": {
      const y = addDays(t, -1);
      return { from: y, to: y };
    }
    case "7d":
      return { from: addDays(t, -6), to: t }; // 7-day window inc. today
    case "30d":
      return { from: addDays(t, -29), to: t };
    case "this_month":
      return { from: firstOfMonth(t), to: t };
    case "last_month":
      return {
        from: firstOfPrevMonth(t),
        to: lastOfPrevMonth(t),
      };
    case "all":
      return { from: null, to: null };
  }
}

/** Reverse: which preset (if any) matches a from/to pair? `custom` if no match. */
export function rangeToPreset(
  from?: string | null,
  to?: string | null,
): DatePreset | "custom" {
  if (!from && !to) return "all";
  for (const p of DATE_PRESETS) {
    if (p.value === "all") continue;
    const r = presetToRange(p.value);
    if (r.from === from && r.to === to) return p.value;
  }
  return "custom";
}

/** Friendly summary of an active range. */
export function describeRange(
  from?: string | null,
  to?: string | null,
): string {
  if (!from && !to) return "All time";
  if (from && to) {
    if (from === to) return `on ${formatPkt(from)}`;
    return `${formatPkt(from)} → ${formatPkt(to)}`;
  }
  if (from) return `from ${formatPkt(from)}`;
  return `up to ${formatPkt(to!)}`;
}

function formatPkt(date: string): string {
  // "2026-05-26" → "26 May 2026"
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
