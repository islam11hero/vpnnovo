"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { orderUsernameOrFilter } from "@/lib/postgrest-filter";
import { renewMarzbanUser } from "@/lib/marzban";
import { MarzbanError } from "@/lib/marzban-error";
import { marzbanFetch, marzbanFetchOrThrow } from "@/lib/marzban-client";
import {
  syncOrderTelemetryCache,
  type CachedTelemetry,
} from "@/lib/orders-telemetry-cache";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

const GB_BYTES = 1073741824;

const REVALIDATE_PATHS = [
  "/admin/clients",
  "/admin",
  "/admin/monitoring",
  "/dashboard",
] as const;

function revalidateAll() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

function guardAdmin(): ActionResult<never> | null {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }
  return null;
}

async function findOrderByUsername(
  username: string,
): Promise<SupabaseOrder | null> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return null;

  const { data } = await db.client
    .from("orders")
    .select("*")
    .or(orderUsernameOrFilter(username))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as SupabaseOrder | null) ?? null;
}

async function syncSupabaseByUsername(
  username: string,
  patch: Partial<CachedTelemetry> & {
    marzbanStatus?: string;
    status?: string;
  },
): Promise<ActionResult<void>> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return actionErr(db.error);

  const update: Record<string, unknown> = {};
  if (patch.usedTraffic !== undefined) update.used_traffic = patch.usedTraffic;
  if (patch.dataLimit !== undefined) update.data_limit = patch.dataLimit;
  if (patch.marzbanStatus !== undefined) {
    update.marzban_status = patch.marzbanStatus;
  }
  if (patch.status !== undefined) update.status = patch.status;

  const { error } = await db.client
    .from("orders")
    .update(update)
    .or(orderUsernameOrFilter(username));

  if (error) {
    return actionErr(error.message);
  }
  return actionOk();
}

async function fetchMarzbanUserSnapshot(
  username: string,
): Promise<ActionResult<CachedTelemetry>> {
  const encoded = encodeURIComponent(username);
  const res = await marzbanFetch(`/api/user/${encoded}`);
  if (!res.success) {
    return actionErr(res.error);
  }
  if (!res.data.ok) {
    const text = await res.data.text();
    return actionErr(text.slice(0, 300) || "Marzban fetch failed");
  }

  const data = await res.data.json<{
    used_traffic?: number;
    data_limit?: number;
    status?: string;
  }>();

  return actionOk({
    usedTraffic: Number(data.used_traffic) || 0,
    dataLimit: Number(data.data_limit) || 0,
    marzbanStatus: data.status ?? "unknown",
  });
}

/**
 * Two-way sync: Marzban data_limit PUT → Supabase cache update.
 */
export async function adjustClientLimit(
  username: string,
  newLimitGB: number,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  const target = username?.trim() ?? "";
  if (!target) return actionErr("Username is required.");
  if (
    !Number.isFinite(newLimitGB) ||
    newLimitGB < 0 ||
    newLimitGB > 10_000
  ) {
    return actionErr("newLimitGB must be between 0 and 10000");
  }

  const data_limit =
    newLimitGB <= 0 ? 0 : Math.floor(newLimitGB * GB_BYTES);

  try {
    const encoded = encodeURIComponent(target);
    const getRes = await marzbanFetchOrThrow(`/api/user/${encoded}`);
    const existing = await getRes.json<Record<string, unknown>>();

    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_limit }),
    });

    if (!putRes.success) return actionErr(putRes.error);
    if (!putRes.data.ok) {
      const text = await putRes.data.text();
      return actionErr(text.slice(0, 300) || "Marzban limit update failed");
    }

    const snapshot = await fetchMarzbanUserSnapshot(target);
    const telemetry: CachedTelemetry = snapshot.success
      ? snapshot.data!
      : {
          usedTraffic: Number(existing.used_traffic) || 0,
          dataLimit: data_limit,
          marzbanStatus: String(existing.status ?? "active"),
        };

    await syncOrderTelemetryCache(target, telemetry);
    const dbSync = await syncSupabaseByUsername(target, telemetry);
    if (!dbSync.success) return dbSync;

    revalidateAll();
    return actionOk();
  } catch (e) {
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Adjust client limit failed";
    return actionErr(message);
  }
}

/**
 * Crypto renewal: reset Marzban usage → extend subscription → mark paid in Supabase.
 */
export async function processCryptoRenewal(
  username: string,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  const target = username?.trim() ?? "";
  if (!target) return actionErr("Username is required.");

  try {
    const encoded = encodeURIComponent(target);
    const resetRes = await marzbanFetch(`/api/user/${encoded}/reset`, {
      method: "POST",
    });

    if (!resetRes.success) return actionErr(resetRes.error);
    if (!resetRes.data.ok) {
      const text = await resetRes.data.text();
      return actionErr(text.slice(0, 300) || "Marzban traffic reset failed");
    }

    const order = await findOrderByUsername(target);
    if (order?.plan_name) {
      try {
        await renewMarzbanUser(target, order.plan_name);
      } catch (renewErr) {
        console.warn(
          "[processCryptoRenewal] Marzban expiry extend failed:",
          renewErr,
        );
      }
    }

    const snapshot = await fetchMarzbanUserSnapshot(target);
    const telemetry: CachedTelemetry = snapshot.success
      ? { ...snapshot.data!, usedTraffic: 0 }
      : { usedTraffic: 0, dataLimit: 0, marzbanStatus: "active" };

    await syncOrderTelemetryCache(target, telemetry);
    const dbSync = await syncSupabaseByUsername(target, {
      ...telemetry,
      status: "paid",
    });
    if (!dbSync.success) return dbSync;

    revalidateAll();
    return actionOk();
  } catch (e) {
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Crypto renewal sync failed";
    return actionErr(message);
  }
}

/**
 * Two-way sync: Marzban status PUT → Supabase marzban_status.
 */
export async function toggleClientSuspension(
  username: string,
  suspend: boolean,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  const target = username?.trim() ?? "";
  if (!target) return actionErr("Username is required.");

  const marzbanStatus = suspend ? "disabled" : "active";

  try {
    const encoded = encodeURIComponent(target);
    const getRes = await marzbanFetchOrThrow(`/api/user/${encoded}`);
    const existing = await getRes.json<Record<string, unknown>>();

    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: marzbanStatus }),
    });

    if (!putRes.success) return actionErr(putRes.error);
    if (!putRes.data.ok) {
      const text = await putRes.data.text();
      return actionErr(text.slice(0, 300) || "Marzban status update failed");
    }

    const telemetry: CachedTelemetry = {
      usedTraffic: Number(existing.used_traffic) || 0,
      dataLimit: Number(existing.data_limit) || 0,
      marzbanStatus,
    };

    await syncOrderTelemetryCache(target, telemetry);
    const dbSync = await syncSupabaseByUsername(target, telemetry);
    if (!dbSync.success) return dbSync;

    revalidateAll();
    return actionOk();
  } catch (e) {
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : suspend
            ? "Suspend failed"
            : "Activate failed";
    return actionErr(message);
  }
}

/** @deprecated Use adjustClientLimit */
export async function updateDataLimitAction(input: {
  username: string;
  dataLimitGb: number;
}): Promise<ActionResult<void>> {
  return adjustClientLimit(input.username, input.dataLimitGb);
}

/** @deprecated Use processCryptoRenewal */
export async function resetTrafficAction(
  username: string,
): Promise<ActionResult<void>> {
  return processCryptoRenewal(username);
}

/** @deprecated Use toggleClientSuspension(username, true) */
export async function suspendClientAction(
  username: string,
): Promise<ActionResult<void>> {
  return toggleClientSuspension(username, true);
}

/** @deprecated Use toggleClientSuspension(username, false) */
export async function activateClientAction(
  username: string,
): Promise<ActionResult<void>> {
  return toggleClientSuspension(username, false);
}
