"use client";

type ResourceState<T> =
  | { status: "pending"; promise: Promise<void> }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

export type NocFetchResource<T> = {
  read: () => T;
  preload: () => void;
  invalidate: () => void;
};

export function createNocFetchResource<T>(
  fetcher: () => Promise<T>,
): NocFetchResource<T> {
  let state: ResourceState<T>;

  function load() {
    state = {
      status: "pending",
      promise: fetcher()
        .then((data) => {
          state = { status: "success", data };
        })
        .catch((err: unknown) => {
          state = {
            status: "error",
            error: err instanceof Error ? err : new Error(String(err)),
          };
        }),
    };
  }

  load();

  return {
    read() {
      if (state.status === "pending") throw state.promise;
      if (state.status === "error") throw state.error;
      return state.data;
    },
    preload() {
      if (state.status === "pending") {
        void state.promise;
      }
    },
    invalidate() {
      load();
    },
  };
}

export async function nocJsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API Offline (${res.status})`);
  }
  return res.json() as Promise<T>;
}
