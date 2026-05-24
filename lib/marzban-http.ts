import { MarzbanError } from "@/lib/marzban-error";
import type { MarzbanFetchResult } from "@/lib/marzban-fetch-types";

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

export function resolveMarzbanApiUrlSafe(): MarzbanFetchResult<string> {
  const url = resolveMarzbanApiUrl();
  if (!url) {
    return {
      success: false,
      data: null,
      error: "MARZBAN_API_URL is not configured",
    };
  }
  return { success: true, data: url, status: 200 };
}
