"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { refreshAdminTelemetry } from "@/actions/admin-refresh";

type NocRefreshContextValue = {
  refreshKey: number;
  refreshing: boolean;
  refreshTelemetry: () => Promise<void>;
};

const NocRefreshContext = createContext<NocRefreshContextValue | null>(null);

export function NocRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTelemetry = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAdminTelemetry();
      setRefreshKey((k) => k + 1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const value = useMemo(
    () => ({ refreshKey, refreshing, refreshTelemetry }),
    [refreshKey, refreshing, refreshTelemetry],
  );

  return (
    <NocRefreshContext.Provider value={value}>
      {children}
    </NocRefreshContext.Provider>
  );
}

export function useNocRefresh() {
  const ctx = useContext(NocRefreshContext);
  if (!ctx) {
    throw new Error("useNocRefresh must be used within NocRefreshProvider");
  }
  return ctx;
}
