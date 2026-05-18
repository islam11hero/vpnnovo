"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import {
  executeMarzbanAdminAction,
  fetchMarzbanUserSubscriptionLink,
  MarzbanError,
  setMarzbanUserStatus,
} from "@/lib/marzban";
import { isAdminAuthenticated } from "@/lib/require-admin";

const REVALIDATE_PATHS = ["/admin/clients", "/admin", "/admin/monitoring"] as const;

function revalidateClientSurfaces() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

function guardAdmin(): ActionResult<never> | null {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }
  return null;
}

function mapMarzbanError(e: unknown): ActionResult<never> {
  const message =
    e instanceof MarzbanError
      ? e.message
      : e instanceof Error
        ? e.message
        : "Marzban action failed.";
  return actionErr(message);
}

export async function copyMarzbanSubLinkAction(
  username: string,
): Promise<ActionResult<{ subLink: string }>> {
  const denied = guardAdmin();
  if (denied) return denied;

  const target = username?.trim() ?? "";
  if (!target) return actionErr("Username is required.");

  try {
    const subLink = await fetchMarzbanUserSubscriptionLink(target);
    return actionOk({ subLink });
  } catch (e) {
    return mapMarzbanError(e);
  }
}

export async function suspendMarzbanUserAction(
  username: string,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  try {
    await setMarzbanUserStatus(username.trim(), "disabled");
    revalidateClientSurfaces();
    return actionOk();
  } catch (e) {
    return mapMarzbanError(e);
  }
}

export async function activateMarzbanUserAction(
  username: string,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  try {
    await setMarzbanUserStatus(username.trim(), "active");
    revalidateClientSurfaces();
    return actionOk();
  } catch (e) {
    return mapMarzbanError(e);
  }
}

export async function resetMarzbanUserTrafficAction(
  username: string,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  try {
    await executeMarzbanAdminAction("reset_usage", username.trim());
    revalidateClientSurfaces();
    return actionOk();
  } catch (e) {
    return mapMarzbanError(e);
  }
}

export async function deleteMarzbanUserAction(
  username: string,
): Promise<ActionResult<void>> {
  const denied = guardAdmin();
  if (denied) return denied;

  try {
    await executeMarzbanAdminAction("delete", username.trim());
    revalidateClientSurfaces();
    return actionOk();
  } catch (e) {
    return mapMarzbanError(e);
  }
}
