"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { MarzbanError, provisionManualMarzbanUser } from "@/lib/marzban";
import { extractMarzbanSubscriptionFromPayload } from "@/lib/marzban-subscription";
import { getMarzbanApiUrl, marzbanFetchJson } from "@/lib/marzban-client";
import { resolvePortalUrl } from "@/lib/vip-handoff";
import { updateOrderVpnFields } from "@/lib/order-vpn-update";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { VIP_FREE_PLAN_NAME } from "@/lib/vip-constants";

export type VipProvisionResult = {
  accessCode: string;
  subLink: string;
  message: string;
  username: string;
  orderId: string;
  clientLink: string;
  portalLink: string;
};

const PENDING_SUB_PREFIX = "Link pending";

function isPendingSubLink(subLink: string): boolean {
  return subLink.startsWith(PENDING_SUB_PREFIX);
}

/** Pull subscription link from Marzban user payload (Axios-safe). */
function resolveSubLinkFromMarzbanPayload(
  apiUrl: string,
  raw: unknown,
  fallbackUsername: string,
): string {
  const extracted = extractMarzbanSubscriptionFromPayload(apiUrl, raw);
  if (extracted.trim()) return extracted.trim();

  const payload =
    raw && typeof raw === "object"
      ? (raw as { subscription_url?: string; links?: string[] })
      : null;

  const subLink =
    payload?.subscription_url?.trim() ||
    (payload?.links && payload.links.length > 0 ? payload.links[0] : "") ||
    "";

  if (subLink) return subLink;

  return `${PENDING_SUB_PREFIX} — open Marzban panel for ${fallbackUsername}`;
}

async function fetchSubLinkAfterCreate(
  username: string,
  createPayload: unknown,
): Promise<string> {
  let apiUrl: string;
  try {
    apiUrl = getMarzbanApiUrl();
  } catch {
    return resolveSubLinkFromMarzbanPayload("", createPayload, username);
  }

  const fromCreate = resolveSubLinkFromMarzbanPayload(
    apiUrl,
    createPayload,
    username,
  );
  if (!isPendingSubLink(fromCreate)) {
    return fromCreate;
  }

  const getRes = await marzbanFetchJson<Record<string, unknown>>(
    `/api/user/${encodeURIComponent(username)}`,
  );
  if (getRes.success) {
    const fromGet = resolveSubLinkFromMarzbanPayload(
      apiUrl,
      getRes.data,
      username,
    );
    if (!isPendingSubLink(fromGet)) {
      return fromGet;
    }
  }

  return fromCreate;
}

/** Only roll back Supabase when Marzban never created the user. */
function shouldRollbackSupabaseOrder(error: unknown): boolean {
  if (!(error instanceof MarzbanError)) return true;
  if (error.status === 409) return true;
  return error.status < 500;
}

export async function provisionFreeVipClientAction(input: {
  username: string;
  months: number;
  dataLimitGb: number;
}): Promise<ActionResult<VipProvisionResult>> {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return actionErr(db.error);
  }

  const orderId = randomUUID();
  const accessCode = orderId;

  const { error: insertError } = await db.client.from("orders").insert({
    id: orderId,
    plan_name: VIP_FREE_PLAN_NAME,
    amount: 0,
    status: "paid",
    is_renewal: false,
  });

  if (insertError) {
    return actionErr(insertError.message ?? "Failed to register order in Supabase");
  }

  try {
    const { username, sub_link, createPayload } =
      await provisionManualMarzbanUser({
        username: input.username,
        planName: VIP_FREE_PLAN_NAME,
        months: input.months,
        dataLimitGb: input.dataLimitGb,
      });

    const subLink =
      sub_link?.trim() ||
      (await fetchSubLinkAfterCreate(username, createPayload));

    const updateResult = await updateOrderVpnFields(db.client, orderId, {
      username,
      subLink: isPendingSubLink(subLink) ? null : subLink,
      status: "paid",
    });

    if (!updateResult.ok) {
      return actionErr(
        updateResult.error ??
          "Marzban user created but Supabase update failed. Check panel manually.",
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/monitoring");
    revalidatePath(`/dashboard/${orderId}`);
    revalidatePath(`/portal/${orderId}`);

    const portalLink = resolvePortalUrl(orderId);

    return actionOk({
      accessCode,
      subLink,
      message: isPendingSubLink(subLink)
        ? "VIP Client Provisioned — subscription link pending"
        : "VIP Client Provisioned",
      username,
      orderId,
      clientLink: portalLink,
      portalLink,
    });
  } catch (e) {
    if (shouldRollbackSupabaseOrder(e)) {
      await db.client.from("orders").delete().eq("id", orderId);
    }

    if (e instanceof MarzbanError && e.status === 409) {
      return actionErr(
        "Username already exists in Marzban. Please choose another.",
      );
    }

    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "VIP provisioning failed.";
    return actionErr(message);
  }
}
