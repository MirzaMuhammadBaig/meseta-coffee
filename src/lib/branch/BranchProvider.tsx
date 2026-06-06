"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Branch } from "@/lib/data/branches-helpers";

/**
 * Tracks which Meseta branch the customer is "shopping from" right now.
 *
 *   • `branches`        — full list (provided by server, never changes mid-session)
 *   • `currentBranchId` — customer's selection, persisted in localStorage
 *   • `setBranchId(id)` — switch branches (cart provider listens to this too)
 *   • `hasChosen`       — true once the customer has explicitly picked,
 *                         so the first-visit modal only shows once.
 *
 * Default branch (before the customer picks) is the `is_main` row,
 * or the first sorted branch as a fallback.
 */

// Bumped from v1 → v2 when the picker moved off the home page and onto
// order-intent routes. Users who chose under v1 deserve to see the new
// per-page picker once so they confirm the choice in the new context.
const STORAGE_KEY = "meseta.branch.id.v2";
const CHOSEN_KEY = "meseta.branch.chosen.v2";

type Ctx = {
  branches: Branch[];
  current: Branch | null;
  currentBranchId: string | null;
  setBranchId: (id: string) => void;
  hasChosen: boolean;
  /** True until the first effect runs — components can avoid SSR/CSR mismatch by waiting. */
  ready: boolean;
};

const BranchContext = createContext<Ctx>({
  branches: [],
  current: null,
  currentBranchId: null,
  setBranchId: () => {},
  hasChosen: false,
  ready: false,
});

export function BranchProvider({
  branches,
  children,
}: {
  branches: Branch[];
  children: React.ReactNode;
}) {
  const defaultBranchId = useMemo(() => {
    const main = branches.find((b) => b.is_main);
    return main?.id ?? branches[0]?.id ?? null;
  }, [branches]);

  const [currentBranchId, setCurrentBranchId] = useState<string | null>(
    defaultBranchId,
  );
  const [hasChosen, setHasChosen] = useState(false);
  const [ready, setReady] = useState(false);

  // Restore from localStorage on mount.
  useEffect(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      const chosen = localStorage.getItem(CHOSEN_KEY) === "1";
      // Only honour the saved id if it still corresponds to an active branch
      // (the admin may have deactivated it since the customer last picked).
      if (savedId && branches.some((b) => b.id === savedId)) {
        setCurrentBranchId(savedId);
      }
      setHasChosen(chosen);
    } catch {
      // localStorage unavailable (private mode etc.) — fall through to default.
    }
    setReady(true);
  }, [branches]);

  const setBranchId = useCallback((id: string) => {
    setCurrentBranchId(id);
    setHasChosen(true);
    try {
      localStorage.setItem(STORAGE_KEY, id);
      localStorage.setItem(CHOSEN_KEY, "1");
    } catch {
      // ignore — non-persistent session is acceptable
    }
  }, []);

  const current = useMemo(
    () => branches.find((b) => b.id === currentBranchId) ?? null,
    [branches, currentBranchId],
  );

  const value = useMemo<Ctx>(
    () => ({
      branches,
      current,
      currentBranchId,
      setBranchId,
      hasChosen,
      ready,
    }),
    [branches, current, currentBranchId, setBranchId, hasChosen, ready],
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}
