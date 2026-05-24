"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { ProxyOrderRow } from "@/lib/supabase/proxy-types";

export async function deliverProxyOrderAction(input: {
  proxyOrderId: string;
  deliveryPayload: string;
  adminNote?: string;
}): Promise<ActionResult<{ id: string }>> {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }

  const payload = input.deliveryPayload.trim();
  if (!payload) {
    return actionErr("Delivery credentials are required.");
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return actionErr(db.error);
  }

  const { data: row, error: fetchError } = await db.client
    .from("proxy_orders")
    .select("id, status")
    .eq("id", input.proxyOrderId)
    .maybeSingle();

  if (fetchError || !row) {
    return actionErr("Proxy order not found");
  }

  if (row.status !== "paid" && row.status !== "processing") {
    return actionErr("Only paid or processing orders can be delivered.");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await db.client
    .from("proxy_orders")
    .update({
      status: "delivered",
      delivery_payload: payload,
      admin_note: input.adminNote?.trim() || null,
      delivered_at: now,
    })
    .eq("id", input.proxyOrderId);

  if (updateError) {
    return actionErr(updateError.message);
  }

  const { data: delivered } = await db.client
    .from("proxy_orders")
    .select("vault_order_id")
    .eq("id", input.proxyOrderId)
    .maybeSingle();

  revalidatePath("/admin/proxies");
  revalidatePath("/dashboard");
  const vaultId =
    typeof delivered?.vault_order_id === "string"
      ? delivered.vault_order_id.trim()
      : "";
  if (vaultId) {
    revalidatePath(`/portal/${vaultId}`);
  }

  return actionOk({ id: input.proxyOrderId });
}

export async function markProxyProcessingAction(
  proxyOrderId: string,
): Promise<ActionResult<{ id: string }>> {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return actionErr(db.error);
  }

  const { error } = await db.client
    .from("proxy_orders")
    .update({ status: "processing" })
    .eq("id", proxyOrderId)
    .eq("status", "paid");

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath("/admin/proxies");
  return actionOk({ id: proxyOrderId });
}

export async function loadClientProxyOrdersAction(
  vaultOrderId?: string,
): Promise<ActionResult<ProxyOrderRow[]>> {
  const vaultId = vaultOrderId?.trim() ?? "";
  const supabase = await import("@/lib/supabase/server").then((m) =>
    m.createSupabaseServerClient(),
  );

  let userId: string | null = null;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId && !vaultId) {
    return actionErr("No vault context");
  }

  const { loadProxyOrdersForClient } = await import("@/lib/proxy-orders-loader");
  const orders = await loadProxyOrdersForClient({
    userId,
    vaultOrderId: vaultId,
  });
  return actionOk(orders);
}
