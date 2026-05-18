"use client";

import { createContext, useContext } from "react";

type Ctx = {
  isOpen: boolean;
  closedMessage: string | null;
};

const StoreStatusContext = createContext<Ctx>({
  isOpen: true,
  closedMessage: null,
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
