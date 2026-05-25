// Pure types + constants for the busyness feature.
// Kept out of `busyness.ts` (which is `"use server"`) because that file
// can only export async functions.

export const BUSYNESS_LEVELS = ["normal", "busy", "super_busy"] as const;
export type BusynessLevel = (typeof BUSYNESS_LEVELS)[number];

export const BUSYNESS_MULTIPLIERS: Record<BusynessLevel, number> = {
  normal: 1,
  busy: 2,
  super_busy: 3,
};

export const BUSYNESS_LABELS: Record<BusynessLevel, string> = {
  normal: "Normal",
  busy: "Busy",
  super_busy: "Super busy",
};

export const BUSYNESS_DESCRIPTIONS: Record<BusynessLevel, string> = {
  normal: "Typical service speed.",
  busy: "Wait times roughly doubled.",
  super_busy: "Wait times roughly tripled — peak hours / event rush.",
};

export type AutoProgressMinutes = {
  /** Base minutes from `placed` → `accepted`. */
  placed_to_accepted: number;
  /** Base minutes from `accepted` → `preparing`. */
  accepted_to_preparing: number;
  /** Base minutes from `preparing` → `ready`. */
  preparing_to_ready: number;
};

export const DEFAULT_AUTO_PROGRESS_MINUTES: AutoProgressMinutes = {
  placed_to_accepted: 2,
  accepted_to_preparing: 5,
  preparing_to_ready: 5,
};

/**
 * Compute the next `auto_advance_at` ISO timestamp (or null when the
 * order has reached a stage that requires manual action).
 *
 * Called both when an order is created and on every status transition.
 */
export function nextAutoAdvanceAt(
  nextStatus: string,
  level: BusynessLevel,
  base: AutoProgressMinutes,
): string | null {
  const mult = BUSYNESS_MULTIPLIERS[level] ?? 1;
  let minutes = 0;
  if (nextStatus === "placed") {
    minutes = base.placed_to_accepted;
  } else if (nextStatus === "accepted") {
    minutes = base.accepted_to_preparing;
  } else if (nextStatus === "preparing") {
    minutes = base.preparing_to_ready;
  } else {
    // ready / completed / cancelled — manual from here.
    return null;
  }
  return new Date(Date.now() + minutes * mult * 60_000).toISOString();
}
