import "server-only";

import axios, { isAxiosError, type AxiosRequestConfig, type Method } from "axios";
import https from "https";

import { MarzbanError } from "@/lib/marzban-error";
import {
  MARZBAN_FETCH_TIMEOUT_MS,
  marzbanFetchErrorMessage,
  type MarzbanFetchResult,
} from "@/lib/marzban-fetch-types";
import { resolveMarzbanApiUrlSafe } from "@/lib/marzban-http";

export { getMarzbanApiUrl, resolveMarzbanApiUrl } from "@/lib/marzban-http";

/** Bypass strict TLS for IP-based Marzban panels (self-signed certs). */
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const TOKEN_TIMEOUT_MS = 10_000;

type TokenCache = {
  token: string;
  expiresAtMs: number;
};

const REFRESH_BUFFER_MS = 60_000;
const DEFAULT_TOKEN_TTL_MS = 23 * 60 * 60 * 1000;

let tokenCache: TokenCache | null = null;

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

function decodeJwtExpiryMs(token: string): number | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const payload = JSON.parse(
      Buffer.from(segment, "base64url").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp === "number" && payload.exp > 0) {
      return payload.exp * 1000;
    }
  } catch {
    /* non-JWT */
  }
  return null;
}

function axiosErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "timeout or network error";
    }
    const detail = error.response?.data;
    if (typeof detail === "string" && detail.trim()) {
      return detail.slice(0, 500);
    }
    if (detail && typeof detail === "object") {
      const d = detail as { detail?: unknown; message?: string };
      if (typeof d.message === "string") return d.message;
      if (d.detail != null) {
        return typeof d.detail === "string"
          ? d.detail
          : JSON.stringify(d.detail).slice(0, 500);
      }
    }
    return error.message || "timeout or network error";
  }
  return marzbanFetchErrorMessage(error);
}

/** Fetch-compatible response wrapper for legacy callers. */
export class MarzbanHttpResponse {
  readonly ok: boolean;
  readonly status: number;

  constructor(
    status: number,
    private readonly payload: unknown,
    private readonly rawText?: string,
  ) {
    this.status = status;
    this.ok = status >= 200 && status < 300;
  }

  async json<T = unknown>(): Promise<T> {
    if (typeof this.payload === "string") {
      return JSON.parse(this.payload) as T;
    }
    return this.payload as T;
  }

  async text(): Promise<string> {
    if (this.rawText != null) return this.rawText;
    if (typeof this.payload === "string") return this.payload;
    return JSON.stringify(this.payload ?? "");
  }
}

function getMarzbanCredentials(): MarzbanFetchResult<{
  username: string;
  password: string;
}> {
  const username = cleanEnv(process.env.MARZBAN_USERNAME);
  const password = cleanEnv(process.env.MARZBAN_PASSWORD);
  if (!username || !password) {
    return {
      success: false,
      data: null,
      error: "Missing MARZBAN_USERNAME or MARZBAN_PASSWORD in environment",
    };
  }
  return { success: true, data: { username, password }, status: 200 };
}

function buildUrl(endpoint: string, apiBase: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${apiBase}${path}`;
}

/**
 * Cached Marzban admin bearer token — never throws.
 * FastAPI requires application/x-www-form-urlencoded (not JSON).
 */
export async function getMarzbanToken(): Promise<MarzbanFetchResult<string>> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs - REFRESH_BUFFER_MS > now) {
    return { success: true, data: tokenCache.token, status: 200 };
  }

  const creds = getMarzbanCredentials();
  if (!creds.success) {
    return creds;
  }

  const api = resolveMarzbanApiUrlSafe();
  if (!api.success) {
    return { success: false, data: null, error: api.error };
  }

  const params = new URLSearchParams();
  params.append("username", creds.data.username);
  params.append("password", creds.data.password);
  params.append("grant_type", "password");

  try {
    const response = await axios.post<{ access_token?: string; expires_in?: number }>(
      buildUrl("/api/admin/token", api.data),
      params.toString(),
      {
        httpsAgent,
        timeout: TOKEN_TIMEOUT_MS,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        validateStatus: () => true,
      },
    );

    if (response.status < 200 || response.status >= 300) {
      tokenCache = null;
      const errBody =
        typeof response.data === "object"
          ? JSON.stringify(response.data).slice(0, 300)
          : String(response.data);
      return {
        success: false,
        data: null,
        error: errBody || "Invalid Marzban credentials in .env",
        status: response.status,
      };
    }

    const token = response.data?.access_token;
    if (!token) {
      tokenCache = null;
      return { success: false, data: null, error: "Marzban token response invalid" };
    }

    const jwtExp = decodeJwtExpiryMs(token);
    const expiresInMs =
      typeof response.data.expires_in === "number" && response.data.expires_in > 0
        ? response.data.expires_in * 1000
        : DEFAULT_TOKEN_TTL_MS;

    tokenCache = {
      token,
      expiresAtMs: jwtExp ?? now + expiresInMs,
    };

    return { success: true, data: token, status: 200 };
  } catch (error) {
    tokenCache = null;
    return {
      success: false,
      data: null,
      error: axiosErrorMessage(error),
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
}

export function clearMarzbanTokenCache(): void {
  tokenCache = null;
}

function parseRequestInitBody(
  init?: RequestInit,
): { data?: unknown; contentType?: string } {
  if (!init?.body) return {};

  if (init.body instanceof URLSearchParams) {
    return {
      data: init.body.toString(),
      contentType: "application/x-www-form-urlencoded",
    };
  }

  if (typeof init.body === "string") {
    const headers = new Headers(init.headers);
    const ct = headers.get("Content-Type") ?? "";
    if (ct.includes("application/json")) {
      try {
        return { data: JSON.parse(init.body), contentType: "application/json" };
      } catch {
        return { data: init.body, contentType: ct || undefined };
      }
    }
    return { data: init.body, contentType: ct || undefined };
  }

  return { data: init.body };
}

function headersFromInit(init?: RequestInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init?.headers) return out;
  const h = new Headers(init.headers);
  h.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/**
 * Authenticated Marzban HTTP via Axios — never throws.
 * Supports legacy `(path, RequestInit)` and direct `(endpoint, method, data)`.
 */
export async function marzbanFetch(
  endpoint: string,
  methodOrInit: Method | RequestInit = "GET",
  data: unknown = null,
): Promise<MarzbanFetchResult<MarzbanHttpResponse>> {
  let method: Method = "GET";
  let body: unknown = data;
  let extraHeaders: Record<string, string> = {};

  if (
    typeof methodOrInit === "object" &&
    methodOrInit !== null &&
    !(methodOrInit instanceof URLSearchParams)
  ) {
    const init = methodOrInit as RequestInit;
    method = (init.method ?? "GET").toUpperCase() as Method;
    const parsed = parseRequestInitBody(init);
    body = parsed.data ?? body;
    extraHeaders = headersFromInit(init);
    if (parsed.contentType) {
      extraHeaders["Content-Type"] = parsed.contentType;
    }
  } else if (typeof methodOrInit === "string") {
    method = methodOrInit.toUpperCase() as Method;
  }

  const tokenResult = await getMarzbanToken();
  if (!tokenResult.success) {
    return { success: false, data: null, error: tokenResult.error };
  }

  const api = resolveMarzbanApiUrlSafe();
  if (!api.success) {
    return { success: false, data: null, error: api.error };
  }

  const config: AxiosRequestConfig = {
    url: buildUrl(endpoint, api.data),
    method,
    data: body ?? undefined,
    httpsAgent,
    timeout: MARZBAN_FETCH_TIMEOUT_MS,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${tokenResult.data}`,
      accept: "application/json",
      ...extraHeaders,
    },
  };

  if (body != null && !config.headers?.["Content-Type"] && method !== "GET") {
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
  }

  try {
    const response = await axios.request(config);
    const rawText =
      typeof response.data === "string" ? response.data : undefined;

    return {
      success: true,
      data: new MarzbanHttpResponse(response.status, response.data, rawText),
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: axiosErrorMessage(error),
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
}

/** Hard-fail variant for provisioning flows that must abort on network errors. */
export async function marzbanFetchOrThrow(
  path: string,
  init?: RequestInit,
): Promise<MarzbanHttpResponse> {
  const result = await marzbanFetch(path, init ?? "GET");
  if (!result.success) {
    throw new MarzbanError(result.error, result.status ?? 502);
  }
  return result.data;
}

export async function marzbanFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<MarzbanFetchResult<T>> {
  const res = await marzbanFetch(path, init);
  if (!res.success) {
    return { success: false, data: null, error: res.error, status: res.status };
  }
  if (!res.data.ok) {
    const errText = await res.data.text();
    return {
      success: false,
      data: null,
      error: errText.slice(0, 500) || `Marzban HTTP ${res.status}`,
      status: res.status,
    };
  }
  try {
    const json = await res.data.json<T>();
    return { success: true, data: json, status: res.status };
  } catch {
    return { success: false, data: null, error: "Invalid JSON from Marzban" };
  }
}
