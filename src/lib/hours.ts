import { site } from "@/lib/data/site";

/**
 * Time-of-day helpers that decide whether Meseta is open *right now* from
 * the published `site.hours`.
 *
 * Two wrinkles this handles that a naive check would not:
 *   1. Server rendering runs in UTC — we always convert to Pakistan time
 *      (Asia/Karachi) before comparing.
 *   2. Meseta closes *after* midnight (1:00 AM / 2:00 AM). So a day's
 *      window can spill into the next calendar day, and the current
 *      moment may belong to *yesterday's* still-open window.
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

/** Convert "9:00 AM" / "2:00 AM" / "12:00 PM" into minutes from midnight. */
export function parseHour(s: string): number {
  const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
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

/** Published hours for a weekday index (wraps safely for negatives). */
function hoursFor(weekdayIndex: number) {
  const wd = WEEKDAYS[((weekdayIndex % 7) + 7) % 7];
  return site.hours.find((h) => h.day === wd) ?? null;
}

/**
 * True if Meseta is currently within its published hours.
 *
 * Checks both today's window and yesterday's — because a window opened
 * yesterday at 9 AM and closing at 1 AM is still "open" at 00:30 today.
 */
export function isWithinHours(): boolean {
  const { weekdayIndex, minutes } = pktNow();

  for (const offset of [0, -1]) {
    const day = hoursFor(weekdayIndex + offset);
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
 */
export function getNextOpening(): { dayLabel: string; time: string } | null {
  const { weekdayIndex, minutes } = pktNow();

  // Today's window hasn't started yet → opens later today.
  const today = hoursFor(weekdayIndex);
  if (today && minutes < parseHour(today.open)) {
    return { dayLabel: "today", time: today.open };
  }

  // Otherwise scan forward for the next published day.
  for (let i = 1; i <= 7; i++) {
    const next = hoursFor(weekdayIndex + i);
    if (next) {
      return {
        dayLabel:
          i === 1 ? "tomorrow" : WEEKDAYS[((weekdayIndex + i) % 7 + 7) % 7],
        time: next.open,
      };
    }
  }
  return null;
}
