"use client";

import { useEffect, useMemo, useState } from "react";
import { useStoreStatus } from "@/lib/store-status/StoreStatusProvider";
import { getNextOpening, isWithinHours } from "@/lib/hours";

/**
 * Live store-status, combining two sources of truth:
 *   • the published schedule (`site.hours`) — auto open/close by the clock
 *   • the admin's manual switch (`useStoreStatus`) — a force-close override
 *
 * Re-evaluates every 60s so the hero badges flip on their own when the
 * shop crosses an opening / closing time while the page sits open.
 */

export type LiveStatus = {
  open: boolean;
  reason: "open" | "after_hours" | "manually_closed";
  next: { dayLabel: string; time: string } | null;
  closedMessage: string | null;
};

export function useLiveStoreStatus(): LiveStatus {
  const { isOpen: adminOpen, closedMessage } = useStoreStatus();
  const [tick, setTick] = useState(0);

  // Heartbeat — bumps `tick` so the memo below recomputes the clock.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo<LiveStatus>(() => {
    const within = isWithinHours();
    if (!adminOpen) {
      return {
        open: false,
        reason: "manually_closed",
        next: getNextOpening(),
        closedMessage,
      };
    }
    if (!within) {
      return {
        open: false,
        reason: "after_hours",
        next: getNextOpening(),
        closedMessage,
      };
    }
    return { open: true, reason: "open", next: null, closedMessage };
    // `tick` is an intentional dep — it is the heartbeat that re-runs the
    // clock-dependent checks above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOpen, closedMessage, tick]);
}

/** Human phrase for when the shop next opens — "today at 9:00 AM" etc. */
export function nextWhenPhrase(status: LiveStatus): string {
  const n = status.next;
  if (!n) return "soon";
  if (n.dayLabel === "today") return `today at ${n.time}`;
  if (n.dayLabel === "tomorrow") return `tomorrow at ${n.time}`;
  return `${n.dayLabel} at ${n.time}`;
}

/**
 * Best customer-facing sentence for *why* ordering is unavailable —
 * the admin's custom message for a manual close, or an auto schedule
 * message when the shop is simply outside its published hours.
 */
export function closedReasonMessage(status: LiveStatus): string {
  if (status.open) return "";
  if (status.reason === "manually_closed") {
    return status.closedMessage?.trim()
      ? status.closedMessage
      : "The store is closed for online orders right now.";
  }
  return `We are closed right now — we reopen ${nextWhenPhrase(status)}.`;
}
