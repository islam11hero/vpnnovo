"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { MarzbanError } from "@/lib/marzban";
import { zeroTraceSessionWipe } from "@/lib/marzban/opsec-wipe";
import { resolveMarzbanUsername } from "@/lib/orders";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/uuid";

export async function zeroTraceSessionWipeAction(
  orderId: string,
): Promise<ActionResult<{ newSubLink: string }>> {
  const id = orderId?.trim() ?? "";
  if (!isValidUuid(id)) {
    return actionErr("Invalid order id.");
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return actionErr(db.error);
  }

  const { data: order, error } = await db.client
    .from("orders")
    .select("id, status, vpn_username, marzban_username, vpn_sub_link")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    return actionErr(error?.message ?? "Order not found.");
  }

  const row = order as SupabaseOrder;
  if (row.status !== "paid") {
    return actionErr("Only active paid shields can run a zero-trace wipe.");
  }

  const username = resolveMarzbanUsername(row);
  if (!username) {
    return actionErr("VPN user not provisioned yet.");
  }

  try {
    const newSubLink = await zeroTraceSessionWipe(username);

    const { error: updateError } = await db.client
      .from("orders")
      .update({ vpn_sub_link: newSubLink })
      .eq("id", id);

    if (updateError) {
      return actionErr(updateError.message);
    }

    revalidatePath(`/dashboard/${id}`);
    revalidatePath(`/portal/${id}`);

    return actionOk({ newSubLink });
  } catch (e) {
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Zero-trace wipe failed.";
    return actionErr(message);
  }
}
