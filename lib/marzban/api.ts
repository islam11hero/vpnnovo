import "server-only";

import { MarzbanError } from "@/lib/marzban-error";
import { marzbanFetchOrThrow } from "@/lib/marzban-client";

export type MarzbanUserTelemetry = {
  username: string;
  used_traffic: number;
  data_limit: number;
  expire: number | null;
  status: string;
  note?: string | null;
};

export type MarzbanTelemetryResult =
  | { ok: true; data: MarzbanUserTelemetry }
  | { ok: false; error: string; status?: number };

/**
 * Live bandwidth / status from Marzban `GET /api/user/{username}`.
 */
export async function fetchMarzbanUserTelemetry(
  username: string,
): Promise<MarzbanTelemetryResult> {
  const trimmed = username.trim();
  if (!trimmed) {
    return { ok: false, error: "Missing Marzban username" };
  }

  try {
    const res = await marzbanFetchOrThrow(
      `/api/user/${encodeURIComponent(trimmed)}`,
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        error: errText.slice(0, 200) || `Marzban HTTP ${res.status}`,
        status: res.status,
      };
    }

    const payload = (await res.json()) as {
      username?: string;
      used_traffic?: number;
      data_limit?: number;
      expire?: number | null;
      status?: string;
      note?: string | null;
    };

    return {
      ok: true,
      data: {
        username: payload.username ?? trimmed,
        used_traffic: payload.used_traffic ?? 0,
        data_limit: payload.data_limit ?? 0,
        expire: payload.expire ?? null,
        status: payload.status ?? "unknown",
        note: payload.note ?? null,
      },
    };
  } catch (error) {
    if (error instanceof MarzbanError) {
      return { ok: false, error: error.message, status: error.status };
    }
    const message =
      error instanceof Error ? error.message : "Marzban telemetry unavailable";
    return { ok: false, error: message };
  }
}

/** Update Marzban user note (routing flags, admin markers). */
export async function updateMarzbanUserNote(
  username: string,
  note: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = username.trim();
  if (!trimmed) {
    return { ok: false, error: "Missing Marzban username" };
  }

  try {
    const res = await marzbanFetchOrThrow(
      `/api/user/${encodeURIComponent(trimmed)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note || "" }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        error: errText.slice(0, 200) || `Marzban HTTP ${res.status}`,
      };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof MarzbanError) {
      return { ok: false, error: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Marzban update failed";
    return { ok: false, error: message };
  }
}

/** Portal-safe fetch — returns null when Marzban is unreachable. */
export async function fetchMarzbanUserStats(
  username: string,
): Promise<{
  used_traffic: number;
  data_limit: number;
  expire: number | null;
  status?: string;
} | null> {
  const result = await fetchMarzbanUserTelemetry(username);
  if (!result.ok) return null;
  const { data } = result;
  return {
    used_traffic: data.used_traffic,
    data_limit: data.data_limit,
    expire: data.expire,
    status: data.status,
  };
}
