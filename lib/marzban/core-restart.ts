import "server-only";

import { getMarzbanAdminToken, MarzbanError } from "@/lib/marzban";
import { marzbanFetch } from "@/lib/marzban-http";

/** POST /api/core/restart — flushes Xray sessions and reloads core. */
export async function restartMarzbanCore(): Promise<void> {
  const { token } = await getMarzbanAdminToken();
  const res = await marzbanFetch("/api/core/restart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new MarzbanError(
      text.slice(0, 300) || `Core restart failed (HTTP ${res.status})`,
      res.status,
    );
  }
}
