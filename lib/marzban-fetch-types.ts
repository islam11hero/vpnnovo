export type MarzbanFetchResult<T> =
  | { success: true; data: T; status: number }
  | { success: false; data: null; error: string; status?: number };

export const MARZBAN_FETCH_TIMEOUT_MS = 8_000;

export function marzbanFetchErrorMessage(cause: unknown): string {
  if (cause instanceof Error) {
    if (cause.name === "AbortError") {
      return "timeout or network error";
    }
    return cause.message || "timeout or network error";
  }
  return "timeout or network error";
}
