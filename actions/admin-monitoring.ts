"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { MarzbanError } from "@/lib/marzban-error";
import { marzbanFetchOrThrow } from "@/lib/marzban-client";
import { restartMarzbanCore } from "@/lib/marzban/core-restart";
import { isAdminAuthenticated } from "@/lib/require-admin";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

export async function flushXraySessionsAction(): Promise<ActionResult<{ queued: boolean }>> {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }
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
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }
  const target = username?.trim() ?? "";
  if (!USERNAME_PATTERN.test(target)) {
    return actionErr("Invalid Marzban username.");
  }

  try {
    const encoded = encodeURIComponent(target);
    const getRes = await marzbanFetchOrThrow(`/api/user/${encoded}`);
    if (!getRes.ok) {
      const text = await getRes.text();
      throw new MarzbanError(text.slice(0, 300) || "User not found", getRes.status);
    }
    const putRes = await marzbanFetchOrThrow(`/api/user/${encoded}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
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
