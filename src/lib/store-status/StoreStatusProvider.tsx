"use client";

import { createContext, useContext } from "react";
import type { HourEntry } from "@/lib/hours";

type Ctx = {
  /** Admin's manual is-open switch (raw, not combined with hours). */
  isOpen: boolean;
  /** Custom message shown on the closed banner. */
  closedMessage: string | null;
  /** Live opening hours (from `store_settings.hours`, or static fallback). */
  hours: readonly HourEntry[];
};

const StoreStatusContext = createContext<Ctx>({
  isOpen: true,
  closedMessage: null,
  hours: [],
});

export function StoreStatusProvider({
  value,
  children,
}: {
  value: Ctx;
  children: React.ReactNode;
}) {
  return (
    <StoreStatusContext.Provider value={value}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  return useContext(StoreStatusContext);
}
