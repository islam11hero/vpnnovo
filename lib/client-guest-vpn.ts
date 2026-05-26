import "server-only";

import { buildClientVpnProfile, buildClientVpnStatus } from "@/lib/client-vpn";
import type { ClientVpnContext } from "@/lib/client-vpn";
import { MarzbanError, provisionTrialMarzbanUser } from "@/lib/marzban";
import { updateOrderVpnFields } from "@/lib/order-vpn-update";
import { resolveMarzbanUsername } from "@/lib/orders";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";
import {
  hasTrialAbuseRecord,
  normalizeDeviceHash,
  recordTrialClaim,
} from "@/lib/trial-abuse";
import { extractClientIp } from "@/lib/request-ip";

export const GUEST_PLAN_NAME = "Free day — IPNOVA App";

export type GuestSessionPayload = {
  orderId: string;
  deviceHash: string;
  marzbanUsername: string;
  expiresAt: number;
  planName: string;
  isGuest: true;
  expired: boolean;
};

const ORDER_SELECT =
  "id, plan_name, status, vpn_username, marzban_username, user_id, created_at, used_traffic, data_limit, marzban_status, vpn_sub_link";

async function loadOrderByDeviceHash(
  deviceHash: string,
): Promise<SupabaseOrder | null> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return null;

  const { data: log } = await db.client
    .from("trial_logs")
    .select("order_id")
    .eq("device_hash", deviceHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!log?.order_id) return null;

  const { data: order } = await db.client
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", log.order_id)
    .maybeSingle();

  return (order as SupabaseOrder) ?? null;
}

function orderExpiresAt(order: SupabaseOrder, liveExpire: number | null): number {
  if (liveExpire != null && liveExpire > 0) return liveExpire;
  const created = order.created_at
    ? Math.floor(new Date(order.created_at).getTime() / 1000)
    : Math.floor(Date.now() / 1000);
  return created + 24 * 60 * 60;
}

export async function resolveGuestOrder(
  orderId: string,
  deviceHash: string,
): Promise<SupabaseOrder | null> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return null;

  const { data: log } = await db.client
    .from("trial_logs")
    .select("order_id, device_hash")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!log || log.device_hash !== deviceHash) return null;

  const { data: order } = await db.client
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  return (order as SupabaseOrder) ?? null;
}

export function guestContextFromOrder(order: SupabaseOrder): ClientVpnContext {
  const marzbanUsername = resolveMarzbanUsername(order) ?? "";
  const subscriptionUrl = order.vpn_sub_link?.trim() || "";

  return {
    order,
    marzbanUsername,
    subscriptionUrl,
  };
}

export async function startOrResumeGuestSession(
  request: Request,
  deviceHashRaw: unknown,
): Promise<GuestSessionPayload> {
  const deviceHash = normalizeDeviceHash(deviceHashRaw);
  if (!deviceHash) {
    throw new MarzbanError("Invalid device fingerprint", 400);
  }

  const existing = await loadOrderByDeviceHash(deviceHash);
  if (existing) {
    const username = resolveMarzbanUsername(existing) ?? "";
    const status = await buildClientVpnStatus(guestContextFromOrder(existing));
    const expiresAt = status.expireDate ?? orderExpiresAt(existing, null);
    const expired = !status.eligibility.canConnect;

    return {
      orderId: existing.id,
      deviceHash,
      marzbanUsername: username,
      expiresAt,
      planName: existing.plan_name ?? GUEST_PLAN_NAME,
      isGuest: true,
      expired,
    };
  }

  const ipAddress = extractClientIp(request);
  // Local dev convenience: allow repeated guest sessions on the same device/IP.
  // This is required to test desktop proxy/VPN flows without manually cleaning Supabase tables.
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    (process.env.DEV_ALLOW_TRIAL_REUSE === "1" || process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost"));
  if (!devBypass) {
    const blocked = await hasTrialAbuseRecord(ipAddress, deviceHash);
    if (blocked) {
      throw new MarzbanError(
        "Free trial already used on this device. Create an account or buy a plan.",
        429,
      );
    }
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    throw new MarzbanError("Database unavailable", 503);
  }

  const { data: order, error: insertError } = await db.client
    .from("orders")
    .insert({
      plan_name: GUEST_PLAN_NAME,
      amount: 0,
      status: "paid",
      is_renewal: false,
    })
    .select("id")
    .single();

  if (insertError || !order?.id) {
    throw new MarzbanError("Could not activate free trial", 500);
  }

  const orderId = order.id as string;

  try {
    const { username, sub_link } = await provisionTrialMarzbanUser(orderId);
    const updateResult = await updateOrderVpnFields(db.client, orderId, {
      username,
      subLink: sub_link,
      status: "paid",
    });
    if (!updateResult.ok) {
      throw new MarzbanError(updateResult.error, 500);
    }

    await recordTrialClaim({ ipAddress, deviceHash, orderId });

    const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    return {
      orderId,
      deviceHash,
      marzbanUsername: username,
      expiresAt,
      planName: GUEST_PLAN_NAME,
      isGuest: true,
      expired: false,
    };
  } catch (e) {
    await db.client.from("orders").update({ status: "failed" }).eq("id", orderId);
    throw e;
  }
}

export async function buildGuestVpnStatus(
  ctx: ClientVpnContext,
): Promise<Awaited<ReturnType<typeof buildClientVpnStatus>>> {
  return buildClientVpnStatus(ctx);
}

export async function buildGuestVpnProfile(
  ctx: ClientVpnContext,
  node?: string | null,
): Promise<Awaited<ReturnType<typeof buildClientVpnProfile>>> {
  return buildClientVpnProfile(ctx, node);
}
