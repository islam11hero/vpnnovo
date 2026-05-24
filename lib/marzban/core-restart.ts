import "server-only";

import { MarzbanError } from "@/lib/marzban-error";
import { marzbanFetchOrThrow } from "@/lib/marzban-client";

/** POST /api/core/restart — flushes Xray sessions and reloads core. */
export async function restartMarzbanCore(): Promise<void> {
  const res = await marzbanFetchOrThrow("/api/core/restart", {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new MarzbanError(
      text.slice(0, 300) || `Core restart failed (HTTP ${res.status})`,
      res.status,
    );
  }
}
