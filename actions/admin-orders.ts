"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import {
  executeMarzbanAdminAction,
  getMarzbanAdminToken,
  MarzbanError,
} from "@/lib/marzban";
import { marzbanFetch } from "@/lib/marzban-http";
import { resolveMarzbanUsername } from "@/lib/orders";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/uuid";

function requireAdmin(): ActionResult<never> | null {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }
  return null;
}

async function getOrderForAdmin(
  orderId: string,
): Promise<
  | { ok: true; order: SupabaseOrder }
  | { ok: false; error: string }
> {
  if (!isValidUuid(orderId)) {
    return { ok: false, error: "Invalid order id." };
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, error: db.error };
  }

  const { data: order, error } = await db.client
    .from("orders")
    .select("id, status, vpn_username, marzban_username, vpn_sub_link")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return { ok: false, error: error?.message ?? "Order not found." };
  }

  return { ok: true, order: order as SupabaseOrder };
}

export async function suspendOrderNode(
  orderId: string,
): Promise<ActionResult> {
  const denied = requireAdmin();
  if (denied) return denied;

  const loaded = await getOrderForAdmin(orderId);
  if (!loaded.ok) return actionErr(loaded.error);

  const username = resolveMarzbanUsername(loaded.order);
  if (!username) {
    return actionErr("No Marzban user linked to this order.");
  }

  if (loaded.order.status === "revoked") {
    return actionErr("Node is already revoked.");
  }

  try {
    await executeMarzbanAdminAction("toggle_status", username);
    revalidatePath("/admin");
    return actionOk();
  } catch (error) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Suspend failed.";
    return actionErr(message);
  }
}

export async function resetOrderUsage(
  orderId: string,
): Promise<ActionResult> {
  const denied = requireAdmin();
  if (denied) return denied;

  const loaded = await getOrderForAdmin(orderId);
  if (!loaded.ok) return actionErr(loaded.error);

  const username = resolveMarzbanUsername(loaded.order);
  if (!username) {
    return actionErr("No Marzban user linked to this order.");
  }

  try {
    await executeMarzbanAdminAction("reset_usage", username);
    revalidatePath("/admin");
    return actionOk();
  } catch (error) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Reset failed.";
    return actionErr(message);
  }
}

/** Disable Marzban user + mark Supabase order revoked (anti-fraud instant revoke). */
export async function instantRevokeOrderNode(
  orderId: string,
): Promise<ActionResult> {
  const denied = requireAdmin();
  if (denied) return denied;

  const loaded = await getOrderForAdmin(orderId);
  if (!loaded.ok) return actionErr(loaded.error);

  const username = resolveMarzbanUsername(loaded.order);
  if (!username) {
    return actionErr("No Marzban user linked to this order.");
  }

  if (loaded.order.status === "revoked") {
    return actionErr("Order already revoked.");
  }

  try {
    const { token } = await getMarzbanAdminToken();
    const encoded = encodeURIComponent(username);
    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status: "disabled" }),
    });
    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new MarzbanError(errText.slice(0, 300), putRes.status);
    }
  } catch (error) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Marzban revoke failed.";
    return actionErr(message);
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) return actionErr(db.error);

  const { error: updateError } = await db.client
    .from("orders")
    .update({ status: "revoked", vpn_sub_link: null })
    .eq("id", orderId);

  if (updateError) {
    return actionErr(updateError.message);
  }

  revalidatePath("/admin");
  return actionOk();
}

/** Enforce single-device session cap on Marzban user. */
export async function enforceSessionLimitOrderNode(
  orderId: string,
): Promise<ActionResult> {
  const denied = requireAdmin();
  if (denied) return denied;

  const loaded = await getOrderForAdmin(orderId);
  if (!loaded.ok) return actionErr(loaded.error);

  const username = resolveMarzbanUsername(loaded.order);
  if (!username) {
    return actionErr("No Marzban user linked to this order.");
  }

  if (loaded.order.status === "revoked") {
    return actionErr("Cannot enforce limit on revoked order.");
  }

  try {
    const { token } = await getMarzbanAdminToken();
    const encoded = encodeURIComponent(username);
    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ onlines_limit: 1 }),
    });
    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new MarzbanError(errText.slice(0, 300), putRes.status);
    }
    revalidatePath("/admin");
    return actionOk();
  } catch (error) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Session limit failed.";
    return actionErr(message);
  }
}

/** DELETE Marzban user, then mark Supabase order as revoked. */
export async function revokeOrderNode(
  orderId: string,
): Promise<ActionResult> {
  const denied = requireAdmin();
  if (denied) return denied;

  const loaded = await getOrderForAdmin(orderId);
  if (!loaded.ok) return actionErr(loaded.error);

  const username = resolveMarzbanUsername(loaded.order);

  if (username) {
    try {
      await executeMarzbanAdminAction("delete", username);
    } catch (error) {
      const message =
        error instanceof MarzbanError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Marzban revoke failed.";
      return actionErr(message);
    }
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) return actionErr(db.error);

  const { error: updateError } = await db.client
    .from("orders")
    .update({
      status: "revoked",
      vpn_sub_link: null,
    })
    .eq("id", orderId);

  if (updateError) {
    return actionErr(updateError.message);
  }

  revalidatePath("/admin");
  return actionOk();
}

/** Apply 10Mbps throttle marker on Marzban user (note + status preserved). */
export async function throttleOrderNode(orderId: string): Promise<ActionResult> {
  const denied = requireAdmin();
  if (denied) return denied;

  const loaded = await getOrderForAdmin(orderId);
  if (!loaded.ok) return actionErr(loaded.error);

  const username = resolveMarzbanUsername(loaded.order);
  if (!username) {
    return actionErr("No Marzban user linked to this order.");
  }

  if (loaded.order.status === "revoked") {
    return actionErr("Node is already terminated.");
  }

  try {
    const { token } = await getMarzbanAdminToken();
    const encoded = encodeURIComponent(username);
    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        note: "THROTTLED · 10Mbps cap (admin)",
      }),
    });
    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new MarzbanError(errText.slice(0, 300), putRes.status);
    }
    revalidatePath("/admin");
    return actionOk();
  } catch (error) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Throttle failed.";
    return actionErr(message);
  }
}
