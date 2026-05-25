import { site } from "@/lib/data/site";

/**
 * Time-of-day helpers that decide whether Meseta is open *right now*.
 *
 * Three wrinkles this handles that a naive check would not:
 *   1. Server rendering runs in UTC — we always convert to Pakistan time
 *      (Asia/Karachi) before comparing.
 *   2. Meseta closes *after* midnight (1:00 AM / 2:00 AM). So a day's
 *      window can spill into the next calendar day, and the current
 *      moment may belong to *yesterday's* still-open window.
 *   3. Hours can come from two sources with two formats:
 *        • static seed in `site.hours` — 12-hour "9:00 AM"
 *        • admin-edited `store_settings.hours` — 24-hour "09:00"
 *      The functions here accept either, and `formatHour()` normalises
 *      for display.
 */

const TIMEZONE = "Asia/Karachi";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
type Weekday = (typeof WEEKDAYS)[number];

export type HourEntry = { day: string; open: string; close: string };

/** Convert "9:00 AM" / "01:00" / "12:00 PM" / "23:30" into minutes from midnight. */
export function parseHour(s: string): number {
  if (!s) return 0;
  // 12-hour with AM/PM marker.
  const ampm = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const min = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + min;
  }
  // 24-hour, e.g. "09:00" / "23:30".
  const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    return parseInt(h24[1], 10) * 60 + parseInt(h24[2], 10);
  }
  return 0;
}

/**
 * Normalise any input format to a friendly 12-hour string, e.g.
 *   "09:00"   → "9:00 AM"
 *   "23:30"   → "11:30 PM"
 *   "9:00 AM" → "9:00 AM" (idempotent)
 */
export function formatHour(s: string): string {
  if (!s) return "";
  if (/AM|PM/i.test(s)) return s.toUpperCase().replace(/\s*(AM|PM)/i, " $1");
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return s;
  const h24 = parseInt(m[1], 10);
  const min = m[2];
  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${min} ${period}`;
}

/** Current weekday + minutes-of-day in Pakistan time. */
function pktNow(): { weekdayIndex: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = (parts.find((p) => p.type === "weekday")?.value ??
    "Monday") as Weekday;
  // Some engines emit "24" for midnight under hour12:false — clamp it.
  let hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );

  return {
    weekdayIndex: WEEKDAYS.indexOf(weekday),
    minutes: hour * 60 + minute,
  };
}

/** Look up a day's window in a given hours list (wraps for negative indices). */
function hoursFor(
  hours: readonly HourEntry[],
  weekdayIndex: number,
): HourEntry | null {
  const wd = WEEKDAYS[((weekdayIndex % 7) + 7) % 7];
  return hours.find((h) => h.day === wd) ?? null;
}

/**
 * True if Meseta is currently within its published hours.
 *
 * Checks both today's window and yesterday's — because a window opened
 * yesterday at 9 AM and closing at 1 AM is still "open" at 00:30 today.
 *
 * Pass admin-edited `settings.hours` when available — falls back to the
 * static seed so a missing/empty list still works.
 */
export function isWithinHours(hours: readonly HourEntry[] = site.hours): boolean {
  if (!hours.length) return false;
  const { weekdayIndex, minutes } = pktNow();

  for (const offset of [0, -1]) {
    const day = hoursFor(hours, weekdayIndex + offset);
    if (!day) continue;

    const open = parseHour(day.open);
    let close = parseHour(day.close);
    if (close <= open) close += 1440; // window spills past midnight

    // `offset === -1` shifts yesterday's window back a full day so it can
    // be compared against today's minutes-of-day.
    const base = offset * 1440;
    if (minutes >= open + base && minutes < close + base) return true;
  }
  return false;
}

/**
 * When Meseta next opens after the current moment.
 *  - `null` while currently open
 *  - `{ dayLabel: "today" | "tomorrow" | "Monday", time: "9:00 AM" }`
 *
 * `time` is always returned in friendly 12-hour format, regardless of
 * how it's stored in the source list.
 */
export function getNextOpening(
  hours: readonly HourEntry[] = site.hours,
): { dayLabel: string; time: string } | null {
  if (!hours.length) return null;
  const { weekdayIndex, minutes } = pktNow();

  // Today's window hasn't started yet → opens later today.
  const today = hoursFor(hours, weekdayIndex);
  if (today && minutes < parseHour(today.open)) {
    return { dayLabel: "today", time: formatHour(today.open) };
  }

  // Otherwise scan forward for the next published day.
  for (let i = 1; i <= 7; i++) {
    const next = hoursFor(hours, weekdayIndex + i);
    if (next) {
      return {
        dayLabel:
          i === 1 ? "tomorrow" : WEEKDAYS[((weekdayIndex + i) % 7 + 7) % 7],
        time: formatHour(next.open),
      };
    }
  }
  return null;
}
