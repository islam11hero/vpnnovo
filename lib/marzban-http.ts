import { MarzbanError } from "@/lib/marzban";

const LEGACY_BARE_IP_PATTERN = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?/;

export function getMarzbanApiUrl(): string {
  const raw = process.env.MARZBAN_API_URL?.trim().replace(/\/$/, "") ?? "";
  if (!raw) {
    throw new MarzbanError(
      "MARZBAN_API_URL is not configured. Set https://api.normaroc.com on Vercel.",
      500,
    );
  }
  if (LEGACY_BARE_IP_PATTERN.test(raw.replace(/^https?:\/\//, ""))) {
    throw new MarzbanError(
      "MARZBAN_API_URL must use your Cloudflare domain (e.g. https://api.normaroc.com), not a bare IP.",
      500,
    );
  }
  return raw;
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

  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
    });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Marzban network error";
    throw new MarzbanError(`Marzban unreachable: ${message}`, 502);
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
