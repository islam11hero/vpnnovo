import { MarzbanError } from "@/lib/marzban";

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

/**
 * Validates MARZBAN_API_URL on the server only.
 * Accepts any http(s) URL (domain or IP for local dev). No trailing slash.
 */
export function resolveMarzbanApiUrl(): string | null {
  const raw = cleanEnv(process.env.MARZBAN_API_URL).replace(/\/$/, "");
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getMarzbanApiUrl(): string {
  const url = resolveMarzbanApiUrl();
  if (!url) {
    throw new MarzbanError(
      "MARZBAN_API_URL is not configured. Set a valid http(s) URL in your environment.",
      500,
    );
  }
  return url;
}

/**
 * Marzban API fetch — always no-store, always wrapped in try/catch at call sites.
 */
export async function marzbanFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const apiUrl = getMarzbanApiUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${apiUrl}${normalizedPath}`;

  const timeoutMs = 10_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: init?.signal ?? controller.signal,
    });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Marzban network error";
    throw new MarzbanError(`Marzban unreachable: ${message}`, 502);
  } finally {
    clearTimeout(timer);
  }
}

export async function marzbanFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await marzbanFetch(path, init);
  if (!res.ok) {
    const errText = await res.text();
    throw new MarzbanError(
      `Marzban API error: ${errText.slice(0, 500)}`,
      res.status >= 400 && res.status < 600 ? res.status : 502,
    );
  }
  return (await res.json()) as T;
}
