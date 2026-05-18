"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { getMarzbanAdminToken, MarzbanError } from "@/lib/marzban";
import { restartMarzbanCore } from "@/lib/marzban/core-restart";
import { marzbanFetch } from "@/lib/marzban-http";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

export async function flushXraySessionsAction(): Promise<ActionResult<{ queued: boolean }>> {
  try {
    await restartMarzbanCore();
    revalidatePath("/admin/monitoring");
    return actionOk({ queued: true });
  } catch (e) {
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Flush sessions failed.";
    return actionErr(message);
  }
}

export async function promoteVipNodeAction(
  username: string,
): Promise<ActionResult<{ username: string }>> {
  const target = username?.trim() ?? "";
  if (!USERNAME_PATTERN.test(target)) {
    return actionErr("Invalid Marzban username.");
  }

  try {
    const { token } = await getMarzbanAdminToken();
    const encoded = encodeURIComponent(target);
    const getRes = await marzbanFetch(`/api/user/${encoded}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!getRes.ok) {
      const text = await getRes.text();
      throw new MarzbanError(text.slice(0, 300) || "User not found", getRes.status);
    }
    const existing = (await getRes.json()) as Record<string, unknown>;

    const putRes = await marzbanFetch(`/api/user/${encoded}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...existing,
        status: "active",
        note: `VIP static routing profile · promoted ${new Date().toISOString()}`,
      }),
    });

    if (!putRes.ok) {
      const text = await putRes.text();
      throw new MarzbanError(text.slice(0, 300) || "VIP promotion failed", putRes.status);
    }

    revalidatePath("/admin/monitoring");
    revalidatePath("/admin");
    return actionOk({ username: target });
  } catch (e) {
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "VIP promotion failed.";
    return actionErr(message);
  }
}
