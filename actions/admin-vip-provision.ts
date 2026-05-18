"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { MarzbanError, provisionManualMarzbanUser } from "@/lib/marzban";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { VIP_FREE_PLAN_NAME } from "@/lib/vip-constants";

export type VipProvisionResult = {
  orderId: string;
  username: string;
  subLink: string;
  clientLink: string;
};

function resolveClientDashboardUrl(orderId: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/dashboard/${orderId}`;
}

export async function provisionFreeVipClientAction(input: {
  username: string;
  months: number;
  dataLimitGb: number;
}): Promise<ActionResult<VipProvisionResult>> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return actionErr(db.error);
  }

  const orderId = randomUUID();

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
    const { username, sub_link } = await provisionManualMarzbanUser({
      username: input.username,
      planName: VIP_FREE_PLAN_NAME,
      months: input.months,
      dataLimitGb: input.dataLimitGb,
    });

    const { error: updateError } = await db.client
      .from("orders")
      .update({
        vpn_username: username,
        vpn_sub_link: sub_link,
      })
      .eq("id", orderId);

    if (updateError) {
      return actionErr(
        updateError.message ??
          "Marzban user created but Supabase update failed. Check panel manually.",
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/monitoring");
    revalidatePath(`/dashboard/${orderId}`);
    revalidatePath(`/portal/${orderId}`);

    return actionOk({
      orderId,
      username,
      subLink: sub_link,
      clientLink: resolveClientDashboardUrl(orderId),
    });
  } catch (e) {
    await db.client.from("orders").delete().eq("id", orderId);

    if (e instanceof MarzbanError && e.status === 409) {
      return actionErr("Username already taken, please choose another.");
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
