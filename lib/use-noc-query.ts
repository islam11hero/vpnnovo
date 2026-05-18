"use client";

import { useCallback, useEffect, useState } from "react";

const FETCH_TIMEOUT_MS = 12_000;

export type NocQueryState<T> = {
  loading: boolean;
  data: T | null;
  error: string | null;
  reload: () => void;
};

export async function nocJsonFetch<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`API Offline (${res.status})`);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out — check Marzban/Vultr connectivity.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function useNocQuery<T>(
  buildUrl: (refreshKey: number) => string,
  refreshKey: number,
): NocQueryState<T> {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = buildUrl(refreshKey);

    void nocJsonFetch<T>(url)
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load telemetry");
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buildUrl, refreshKey, tick]);

  return { loading, data, error, reload };
}
