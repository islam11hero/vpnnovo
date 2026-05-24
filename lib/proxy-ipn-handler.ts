import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isProxyPlanName } from "@/lib/proxy-catalog";
import type { SupabaseOrder } from "@/lib/supabase/types";

export type ProxyIpnResult = {
  status: number;
  body: Record<string, unknown>;
};

/** Mark proxy payment settled — no Marzban provisioning. */
export async function fulfillProxyPaymentOrder(
  client: SupabaseClient,
  order: SupabaseOrder,
  paymentCurrency: string | null,
  txHash: string | null,
): Promise<ProxyIpnResult> {
  const now = new Date().toISOString();

  const { error: orderError } = await client
    .from("orders")
    .update({
      status: "paid",
      payment_currency: paymentCurrency,
      tx_hash: txHash,
      payment_provider: "nowpayments",
    })
    .eq("id", order.id);

  if (orderError) {
    return {
      status: 500,
      body: { error: "Proxy order payment update failed" },
    };
  }

  const { error: proxyError } = await client
    .from("proxy_orders")
    .update({
      status: "paid",
      paid_at: now,
    })
    .eq("payment_order_id", order.id);

  if (proxyError) {
    console.error("[proxy IPN] proxy_orders update failed:", proxyError.message);
    return {
      status: 500,
      body: { error: "Proxy queue update failed" },
    };
  }

  return {
    status: 200,
    body: {
      received: true,
      success: true,
      order_id: order.id,
      proxy: true,
      message: "Proxy order queued for manual delivery",
    },
  };
}

export async function markProxyOrderFailed(
  client: SupabaseClient,
  paymentOrderId: string,
): Promise<void> {
  await client.from("orders").update({ status: "failed" }).eq("id", paymentOrderId);
  await client
    .from("proxy_orders")
    .update({ status: "failed" })
    .eq("payment_order_id", paymentOrderId);
}

export function orderIsProxyPayment(order: SupabaseOrder): boolean {
  return isProxyPlanName(order.plan_name);
}
