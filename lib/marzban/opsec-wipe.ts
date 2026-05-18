import "server-only";

import { randomUUID } from "crypto";

import {
  getMarzbanAdminToken,
  MARZBAN_INBOUNDS,
  MARZBAN_PROXIES,
  MarzbanError,
  revokeAndRefreshMarzbanSubscription,
} from "@/lib/marzban";
import { marzbanFetch } from "@/lib/marzban-http";

/**
 * Zero-trace wipe: reset usage, rotate VLESS UUID, revoke subscription token.
 * Returns the new subscription URL path.
 */
export async function zeroTraceSessionWipe(
  targetUsername: string,
): Promise<string> {
  const { token } = await getMarzbanAdminToken();
  const encoded = encodeURIComponent(targetUsername);
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const resetRes = await marzbanFetch(`/api/user/${encoded}/reset`, {
    method: "POST",
    headers: authHeaders,
  });
  if (!resetRes.ok) {
    const errText = await resetRes.text();
    throw new MarzbanError(
      `Failed to reset session usage: ${errText.slice(0, 300)}`,
      resetRes.status,
    );
  }

  const newProxies = {
    vless: {
      ...MARZBAN_PROXIES.vless,
      id: randomUUID(),
    },
  };

  const putRes = await marzbanFetch(`/api/user/${encoded}`, {
    method: "PUT",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proxies: newProxies,
      inbounds: MARZBAN_INBOUNDS,
      status: "active",
      note: `OPSEC zero-trace wipe · ${new Date().toISOString()}`,
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new MarzbanError(
      `Failed to rotate proxy UUID: ${errText.slice(0, 300)}`,
      putRes.status,
    );
  }

  return revokeAndRefreshMarzbanSubscription(targetUsername);
}
