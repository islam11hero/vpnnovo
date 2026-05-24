import "server-only";

import { randomUUID } from "crypto";

import {
  MARZBAN_PROXIES,
  revokeAndRefreshMarzbanSubscription,
} from "@/lib/marzban";
import { MarzbanError } from "@/lib/marzban-error";
import { marzbanFetchOrThrow } from "@/lib/marzban-client";

/**
 * Zero-trace wipe: reset usage, rotate VLESS UUID, revoke subscription token.
 * Returns the new subscription URL path.
 */
export async function zeroTraceSessionWipe(
  targetUsername: string,
): Promise<string> {
  const encoded = encodeURIComponent(targetUsername);

  const resetRes = await marzbanFetchOrThrow(`/api/user/${encoded}/reset`, {
    method: "POST",
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

  const putRes = await marzbanFetchOrThrow(`/api/user/${encoded}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      proxies: newProxies,
      status: "active",
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
