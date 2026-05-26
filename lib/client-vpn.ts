import "server-only";

import axios from "axios";
import https from "https";

import type { User } from "@supabase/supabase-js";

import { buildSingboxProfileUrl } from "@/lib/protocol-links";
import {
  buildSingboxConfigFromVlessUri,
  extractVlessUriFromSubscription,
} from "@/lib/vless-singbox";
import { fetchLiveMarzbanTelemetry } from "@/lib/marzban-telemetry";
import type { ClientMarzbanTelemetry } from "@/lib/marzban-types";
import { extractMarzbanSubscriptionLink } from "@/lib/marzban";
import { getMarzbanApiUrl } from "@/lib/marzban-client";
import { loadClientDashboardShell } from "@/lib/client-dashboard-loader";
import { resolveMarzbanUsername } from "@/lib/orders";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export type VpnEligibility = {
  canConnect: boolean;
  reason?: string;
  reasonAr?: string;
};

export type ClientVpnContext = {
  order: SupabaseOrder;
  marzbanUsername: string;
  subscriptionUrl: string;
};

export type ClientVpnStatusPayload = {
  orderId: string;
  planName: string;
  marzbanUsername: string;
  status: string;
  usedTraffic: number;
  dataLimit: number;
  expireDate: number | null;
  remainingBytes: number | null;
  usagePercent: number | null;
  eligibility: VpnEligibility;
  telemetryLive: boolean;
  telemetryError?: string;
};

export type ClientVpnProfilePayload = {
  orderId: string;
  marzbanUsername: string;
  config: Record<string, unknown>;
  expiresAt: number | null;
  eligibility: VpnEligibility;
};

function evaluateEligibility(
  telemetry: ClientMarzbanTelemetry,
  order: SupabaseOrder,
): VpnEligibility {
  if (order.status !== "paid") {
    return {
      canConnect: false,
      reason: "Order is not active",
      reasonAr: "الاشتراك غير مفعّل — أكمل الدفع من لوحة الحساب",
    };
  }

  const status = telemetry.status.toLowerCase();
  if (status === "disabled" || status === "limited") {
    return {
      canConnect: false,
      reason: `Account status: ${telemetry.status}`,
      reasonAr: "الحساب موقوف — تواصل مع الدعم أو جدّد الاشتراك",
    };
  }

  if (telemetry.expireDate != null && telemetry.expireDate > 0) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (telemetry.expireDate <= nowSec) {
      return {
        canConnect: false,
        reason: "Subscription expired",
        reasonAr: "انتهت صلاحية الاشتراك — جدّد من موقع الحساب",
      };
    }
  }

  if (telemetry.dataLimit > 0 && telemetry.usedTraffic >= telemetry.dataLimit) {
    return {
      canConnect: false,
      reason: "Data limit reached",
      reasonAr: "انتهت حصة المرور — جدّد أو انتظر إعادة التعيين",
    };
  }

  return { canConnect: true };
}

export async function loadClientVpnContext(
  user: User,
): Promise<ClientVpnContext | null> {
  const shell = await loadClientDashboardShell(user.id);
  if (!shell?.marzbanUsername) return null;

  const subscriptionUrl =
    shell.subscriptionUrl?.trim() ||
    (await resolveSubscriptionForUser(shell.marzbanUsername));

  if (!subscriptionUrl) return null;

  return {
    order: shell.order,
    marzbanUsername: shell.marzbanUsername,
    subscriptionUrl,
  };
}

async function resolveSubscriptionForUser(
  username: string,
): Promise<string | null> {
  const live = await fetchLiveMarzbanTelemetry(username);
  return live.telemetry?.subscriptionUrl?.trim() || null;
}

export async function buildClientVpnStatus(
  ctx: ClientVpnContext,
): Promise<ClientVpnStatusPayload> {
  const live = await fetchLiveMarzbanTelemetry(ctx.marzbanUsername);
  const telemetry =
    live.telemetry ??
    ({
      username: ctx.marzbanUsername,
      usedTraffic: Number(ctx.order.used_traffic) || 0,
      dataLimit: Number(ctx.order.data_limit) || 0,
      status: ctx.order.marzban_status ?? "unknown",
      expireDate: null,
      subscriptionUrl: ctx.subscriptionUrl,
      links: [],
      proxies: {},
    } satisfies ClientMarzbanTelemetry);

  const eligibility = evaluateEligibility(telemetry, ctx.order);
  const dataLimit = telemetry.dataLimit;
  const usedTraffic = telemetry.usedTraffic;
  const remainingBytes =
    dataLimit > 0 ? Math.max(0, dataLimit - usedTraffic) : null;
  const usagePercent =
    dataLimit > 0
      ? Math.min(100, Math.round((usedTraffic / dataLimit) * 100))
      : null;

  return {
    orderId: ctx.order.id,
    planName: ctx.order.plan_name,
    marzbanUsername: ctx.marzbanUsername,
    status: telemetry.status,
    usedTraffic,
    dataLimit,
    expireDate: telemetry.expireDate,
    remainingBytes,
    usagePercent,
    eligibility,
    telemetryLive: live.live,
    telemetryError: live.error,
  };
}

export async function refreshClientVpnSubscription(
  ctx: ClientVpnContext,
): Promise<string> {
  const live = await fetchLiveMarzbanTelemetry(ctx.marzbanUsername);
  const sub =
    live.telemetry?.subscriptionUrl?.trim() ||
    (await fetchSubscriptionFromMarzbanUser(ctx.marzbanUsername));

  if (!sub) {
    throw new Error("Could not refresh subscription from Marzban");
  }

  const db = getSupabaseAdminResult();
  if (db.ok) {
    await db.client
      .from("orders")
      .update({ vpn_sub_link: sub })
      .eq("id", ctx.order.id);
  }

  return sub;
}

async function fetchSubscriptionFromMarzbanUser(
  username: string,
): Promise<string | null> {
  try {
    const apiUrl = getMarzbanApiUrl();
    const live = await fetchLiveMarzbanTelemetry(username);
    if (live.telemetry?.subscriptionUrl) {
      return live.telemetry.subscriptionUrl;
    }
    return extractMarzbanSubscriptionLink(apiUrl, {
      subscription_url: live.telemetry?.subscriptionUrl ?? undefined,
      links: live.telemetry?.links,
    });
  } catch {
    return null;
  }
}

function parseSubscriptionBody(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Empty subscription response");
  }

  try {
    const json = JSON.parse(trimmed) as unknown;
    if (json && typeof json === "object" && !Array.isArray(json)) {
      return json as Record<string, unknown>;
    }
  } catch {
    /* not JSON */
  }

  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    const json = JSON.parse(decoded) as unknown;
    if (json && typeof json === "object" && !Array.isArray(json)) {
      return json as Record<string, unknown>;
    }
  } catch {
    /* not base64 json */
  }

  const vlessUri = extractVlessUriFromSubscription(trimmed);
  if (vlessUri) {
    return buildSingboxConfigFromVlessUri(vlessUri);
  }

  throw new Error(
    "Unsupported subscription format — ensure VLESS or sing-box export in Marzban",
  );
}

/** Fetch sing-box JSON from Marzban subscription URL (server-side only). */
export async function fetchSingboxConfig(
  subscriptionUrl: string,
  node?: string | null,
): Promise<Record<string, unknown>> {
  const profileUrl = buildSingboxProfileUrl(subscriptionUrl, node);

  const response = await axios.get<string>(profileUrl, {
    httpsAgent,
    timeout: 25_000,
    responseType: "text",
    transformResponse: [(data) => data],
    validateStatus: (status) => status >= 200 && status < 300,
    headers: { Accept: "application/json, text/plain, */*" },
  });

  return parseSubscriptionBody(String(response.data ?? ""));
}

export async function buildClientVpnProfile(
  ctx: ClientVpnContext,
  node?: string | null,
): Promise<ClientVpnProfilePayload> {
  const status = await buildClientVpnStatus(ctx);
  if (!status.eligibility.canConnect) {
    return {
      orderId: ctx.order.id,
      marzbanUsername: ctx.marzbanUsername,
      config: {},
      expiresAt: status.expireDate,
      eligibility: status.eligibility,
    };
  }

  const sub = await refreshClientVpnSubscription(ctx);
  const config = await fetchSingboxConfig(sub, node);

  return {
    orderId: ctx.order.id,
    marzbanUsername: ctx.marzbanUsername,
    config,
    expiresAt: status.expireDate,
    eligibility: status.eligibility,
  };
}

export function orderHasMarzbanUser(order: SupabaseOrder): boolean {
  return Boolean(resolveMarzbanUsername(order));
}
