import { getMarzbanApiUrl, marzbanFetch } from "@/lib/marzban-http";

/** God-Tier dual-core: VLESS Vision TCP + gRPC (stable panel inbounds). */
export const MARZBAN_PROXIES = {
  vless: {
    flow: "xtls-rprx-vision",
  },
} as const;

export const MARZBAN_INBOUNDS = {
  vless: [
    "VLESS TCP REALITY (Vision Stealth)",
    "VLESS gRPC (AdsPower Beast)",
  ],
} as const;

/** Shared proxies + inbounds for every POST /api/user payload. */
export const MARZBAN_USER_CORE = {
  proxies: MARZBAN_PROXIES,
  inbounds: MARZBAN_INBOUNDS,
} as const;

const ALLOWED_PLANS = new Set([
  "Standard",
  "Pro Shield",
  "1 Month",
  "6 Months",
  "1 Year",
]);

export function planToExpireMonths(planName: string): number {
  if (planName === "6 Months") return 6;
  if (planName === "1 Year") return 12;
  return 1;
}

function resolveSubscriptionUrl(
  apiUrl: string,
  userData: { subscription_url?: string; links?: string[] },
): string {
  let subPath = userData.subscription_url ?? "";
  if (subPath && !subPath.startsWith("http")) {
    subPath = `${apiUrl}${subPath}`;
  } else if (!subPath && userData.links?.length) {
    subPath = userData.links[0];
  }
  return subPath;
}

export function isAllowedPlan(planName: string): boolean {
  return ALLOWED_PLANS.has(planName);
}

export type MarzbanProvisionResult = {
  username: string;
  sub_link: string;
};

export class MarzbanError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = "MarzbanError";
  }
}

export type MarzbanAdminAction = "toggle_status" | "reset_usage" | "delete";

function getMarzbanCredentials() {
  const apiUrl = getMarzbanApiUrl();
  const username = process.env.MARZBAN_USERNAME?.trim();
  const password = process.env.MARZBAN_PASSWORD?.trim();
  if (!username || !password) {
    throw new MarzbanError(
      "Missing MARZBAN_USERNAME or MARZBAN_PASSWORD in environment",
      500,
    );
  }
  return { apiUrl, username, password };
}

export async function getMarzbanAdminToken(): Promise<{
  apiUrl: string;
  token: string;
}> {
  const { apiUrl, username, password } = getMarzbanCredentials();

  const tokenRes = await marzbanFetch("/api/admin/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      username,
      password,
      grant_type: "password",
    }),
  });

  if (!tokenRes.ok) {
    throw new MarzbanError("Invalid Marzban credentials in .env", 401);
  }

  const tokenPayload = (await tokenRes.json()) as { access_token?: string };
  const token = tokenPayload.access_token;
  if (!token) {
    throw new MarzbanError("Marzban token response invalid", 502);
  }

  return { apiUrl, token };
}

export async function executeMarzbanAdminAction(
  action: MarzbanAdminAction,
  targetUsername: string,
): Promise<void> {
  const { token } = await getMarzbanAdminToken();
  const encoded = encodeURIComponent(targetUsername);
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  if (action === "toggle_status") {
    const getRes = await marzbanFetch(`/api/user/${encoded}`, {
      headers: authHeaders,
    });
    if (!getRes.ok) {
      const errText = await getRes.text();
      throw new MarzbanError(
        `Failed to fetch user: ${errText.slice(0, 300)}`,
        getRes.status,
      );
    }
    const user = (await getRes.json()) as { status?: string };
    const isActive = user.status?.toLowerCase() === "active";
    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: isActive ? "disabled" : "active",
      }),
    });
    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new MarzbanError(
        `Failed to update status: ${errText.slice(0, 300)}`,
        putRes.status,
      );
    }
    return;
  }

  if (action === "reset_usage") {
    const resetRes = await marzbanFetch(`/api/user/${encoded}/reset`, {
      method: "POST",
      headers: authHeaders,
    });
    if (!resetRes.ok) {
      const errText = await resetRes.text();
      throw new MarzbanError(
        `Failed to reset usage: ${errText.slice(0, 300)}`,
        resetRes.status,
      );
    }
    return;
  }

  const deleteRes = await marzbanFetch(`/api/user/${encoded}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  if (!deleteRes.ok) {
    const errText = await deleteRes.text();
    throw new MarzbanError(
      `Failed to delete user: ${errText.slice(0, 300)}`,
      deleteRes.status,
    );
  }
}

const TRIAL_DATA_LIMIT_BYTES = 1073741824; // 1 GB — strict cap
const TRIAL_DURATION_SECONDS = 24 * 60 * 60; // 24 hours

/** Trial-only inbound: single Maroc bypass node (anti-abuse guillotine). */
export const MARZBAN_TRIAL_INBOUNDS = {
  vless: ["VLESS TCP REALITY (Maroc Bypass)"],
} as const;

/** Provision a 24-hour / 1GB trial user tied to a Supabase order id. */
export async function provisionTrialMarzbanUser(
  orderId: string,
): Promise<MarzbanProvisionResult> {
  const { apiUrl, token } = await getMarzbanAdminToken();
  const expireTime = Math.floor(Date.now() / 1000) + TRIAL_DURATION_SECONDS;
  const username = `trial_${orderId.substring(0, 8)}`;

  const payload = {
    username,
    proxies: MARZBAN_PROXIES,
    inbounds: MARZBAN_TRIAL_INBOUNDS,
    data_limit: TRIAL_DATA_LIMIT_BYTES,
    expire: expireTime,
    data_limit_reset_strategy: "no_reset" as const,
    status: "active" as const,
    note: "24-Hour Stealth Trial · 1GB",
  };

  const userRes = await marzbanFetch("/api/user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!userRes.ok) {
    const errText = await userRes.text();
    throw new MarzbanError(`Marzban trial error: ${errText.slice(0, 500)}`, 500);
  }

  const userData = (await userRes.json()) as {
    subscription_url?: string;
    links?: string[];
  };

  const subPath = resolveSubscriptionUrl(apiUrl, userData);
  if (!subPath) {
    throw new MarzbanError("Marzban returned no subscription URL", 502);
  }

  return { username, sub_link: subPath };
}

/** Admin manual / VIP provisioning with custom duration and data cap. */
export async function provisionManualMarzbanUser(params: {
  planName: string;
  months: number;
  dataLimitGb: number;
}): Promise<MarzbanProvisionResult> {
  const planName = params.planName.trim();
  if (!planName) {
    throw new MarzbanError("Invalid or missing plan_name", 400);
  }
  if (!Number.isFinite(params.months) || params.months < 1 || params.months > 120) {
    throw new MarzbanError("months must be between 1 and 120", 400);
  }
  if (
    !Number.isFinite(params.dataLimitGb) ||
    params.dataLimitGb < 0 ||
    params.dataLimitGb > 10_000
  ) {
    throw new MarzbanError("data_limit_gb must be between 0 and 10000", 400);
  }

  const { apiUrl, token } = await getMarzbanAdminToken();
  const username = `vip_${Math.random().toString(36).substring(2, 10)}`;
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + Math.floor(params.months));
  const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
  const data_limit =
    params.dataLimitGb <= 0
      ? 0
      : Math.floor(params.dataLimitGb * 1073741824);

  const payload = {
    username,
    ...MARZBAN_USER_CORE,
    expire: expireTimestamp,
    data_limit,
    data_limit_reset_strategy: "no_reset" as const,
    status: "active" as const,
    note: `VIP Manual · ${planName}`,
  };

  const userRes = await marzbanFetch("/api/user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!userRes.ok) {
    const errText = await userRes.text();
    throw new MarzbanError(`Marzban Error: ${errText.slice(0, 500)}`, 500);
  }

  const userData = (await userRes.json()) as {
    subscription_url?: string;
    links?: string[];
  };

  const subPath = resolveSubscriptionUrl(apiUrl, userData);
  if (!subPath) {
    throw new MarzbanError("Marzban returned no subscription URL", 502);
  }

  return { username, sub_link: subPath };
}

/** Ping Marzban admin token endpoint (diagnostics). */
export async function checkMarzbanConnection(): Promise<boolean> {
  try {
    await getMarzbanAdminToken();
    return true;
  } catch {
    return false;
  }
}

/** Create a Marzban user and return subscription link + username. */
export async function provisionMarzbanUser(
  planName: string,
): Promise<MarzbanProvisionResult> {
  if (!isAllowedPlan(planName)) {
    throw new MarzbanError("Invalid or missing planName", 400);
  }

  const { apiUrl, token } = await getMarzbanAdminToken();

  const expireMonths = planToExpireMonths(planName);
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + expireMonths);
  const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
  const randomUsername = `IPNOVA_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const payload = {
    username: randomUsername,
    ...MARZBAN_USER_CORE,
    expire: expireTimestamp,
    data_limit: 0,
    data_limit_reset_strategy: "no_reset" as const,
    status: "active" as const,
    note: `Plan: ${planName}`,
  };

  const userRes = await marzbanFetch("/api/user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!userRes.ok) {
    const errText = await userRes.text();
    throw new MarzbanError(`Marzban Error: ${errText.slice(0, 500)}`, 500);
  }

  const userData = (await userRes.json()) as {
    subscription_url?: string;
    links?: string[];
  };

  const subPath = resolveSubscriptionUrl(apiUrl, userData);

  if (!subPath) {
    throw new MarzbanError("Marzban returned no subscription URL", 502);
  }

  return { username: randomUsername, sub_link: subPath };
}

/** Extend an existing Marzban user's expiry (renewal flow). */
export async function renewMarzbanUser(
  targetUsername: string,
  planName: string,
): Promise<MarzbanProvisionResult> {
  if (!isAllowedPlan(planName)) {
    throw new MarzbanError("Invalid or missing planName", 400);
  }

  const { apiUrl, token } = await getMarzbanAdminToken();
  const encoded = encodeURIComponent(targetUsername);

  const getRes = await marzbanFetch(`/api/user/${encoded}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!getRes.ok) {
    const errText = await getRes.text();
    throw new MarzbanError(
      `Failed to fetch user for renewal: ${errText.slice(0, 300)}`,
      getRes.status,
    );
  }

  const userData = (await getRes.json()) as {
    expire?: number | null;
    subscription_url?: string;
    links?: string[];
  };

  const now = Math.floor(Date.now() / 1000);
  const currentExpire = userData.expire ?? 0;
  const base = currentExpire > now ? currentExpire : now;
  const expireDate = new Date(base * 1000);
  expireDate.setMonth(expireDate.getMonth() + planToExpireMonths(planName));
  const newExpire = Math.floor(expireDate.getTime() / 1000);

  const putRes = await marzbanFetch(`/api/user/${encoded}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      expire: newExpire,
      status: "active",
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new MarzbanError(
      `Failed to renew user: ${errText.slice(0, 300)}`,
      putRes.status,
    );
  }

  const updated = (await putRes.json()) as {
    subscription_url?: string;
    links?: string[];
  };

  const subPath =
    resolveSubscriptionUrl(apiUrl, updated) ||
    resolveSubscriptionUrl(apiUrl, userData);

  if (!subPath) {
    throw new MarzbanError("Marzban returned no subscription URL", 502);
  }

  return { username: targetUsername, sub_link: subPath };
}

export type MarzbanUserStats = {
  used_traffic: number;
  data_limit: number;
  expire: number | null;
  status?: string;
};

/** Revoke subscription token and return the new subscription URL. */
export async function revokeAndRefreshMarzbanSubscription(
  targetUsername: string,
): Promise<string> {
  const { apiUrl, token } = await getMarzbanAdminToken();
  const encoded = encodeURIComponent(targetUsername);
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const revokeRes = await marzbanFetch(`/api/user/${encoded}/revoke_sub`, {
    method: "POST",
    headers: authHeaders,
  });

  if (!revokeRes.ok) {
    const errText = await revokeRes.text();
    throw new MarzbanError(
      `Failed to revoke subscription: ${errText.slice(0, 300)}`,
      revokeRes.status,
    );
  }

  const getRes = await marzbanFetch(`/api/user/${encoded}`, {
    headers: authHeaders,
  });

  if (!getRes.ok) {
    const errText = await getRes.text();
    throw new MarzbanError(
      `Failed to fetch user after revoke: ${errText.slice(0, 300)}`,
      getRes.status,
    );
  }

  const userData = (await getRes.json()) as {
    subscription_url?: string;
    links?: string[];
  };

  const subPath = resolveSubscriptionUrl(apiUrl, userData);
  if (!subPath) {
    throw new MarzbanError("Marzban returned no subscription URL after revoke", 502);
  }

  return subPath;
}

/** Fetch live Marzban user stats (server-only). */
export async function fetchMarzbanUser(
  targetUsername: string,
): Promise<MarzbanUserStats | null> {
  try {
    const { token } = await getMarzbanAdminToken();
    const res = await marzbanFetch(
      `/api/user/${encodeURIComponent(targetUsername)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      used_traffic?: number;
      data_limit?: number;
      expire?: number | null;
      status?: string;
    };
    return {
      used_traffic: data.used_traffic ?? 0,
      data_limit: data.data_limit ?? 0,
      expire: data.expire ?? null,
      status: data.status,
    };
  } catch {
    return null;
  }
}
