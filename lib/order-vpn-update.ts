import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderVpnUpdateInput = {
  username: string;
  subLink: string | null;
  status?: "paid" | "failed" | "pending";
  userId?: string | null;
  paymentCurrency?: string | null;
  txHash?: string | null;
  paymentProvider?: string | null;
};

function isMissingMarzbanUsernameColumn(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("marzban_username") && lower.includes("schema cache");
}

/** Persist Marzban credentials on orders — retries without `marzban_username` if column missing. */
export async function updateOrderVpnFields(
  client: SupabaseClient,
  orderId: string,
  input: OrderVpnUpdateInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmedSub = input.subLink?.trim() || null;
  const base: Record<string, unknown> = {
    vpn_username: input.username.trim(),
    vpn_sub_link: trimmedSub,
  };

  if (input.status) base.status = input.status;
  if (input.userId !== undefined) base.user_id = input.userId;
  if (input.paymentCurrency !== undefined) {
    base.payment_currency = input.paymentCurrency;
  }
  if (input.txHash !== undefined) base.tx_hash = input.txHash;
  if (input.paymentProvider !== undefined) {
    base.payment_provider = input.paymentProvider;
  }

  const withMarzban = {
    ...base,
    marzban_username: input.username.trim(),
  };

  const { error } = await client.from("orders").update(withMarzban).eq("id", orderId);

  if (!error) return { ok: true };

  if (isMissingMarzbanUsernameColumn(error.message)) {
    const { error: fallbackError } = await client
      .from("orders")
      .update(base)
      .eq("id", orderId);

    if (fallbackError) {
      return { ok: false, error: fallbackError.message };
    }
    return { ok: true };
  }

  return { ok: false, error: error.message };
}
