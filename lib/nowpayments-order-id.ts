/**
 * NOWPayments `order_id` encodes Supabase user + order for IPN fulfillment.
 * Format: vip_{userUuid}_{orderUuid}_{timestamp}
 */
const VIP_ORDER_RE =
  /^vip_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_(\d+)$/i;

export function buildVipNowPaymentsOrderId(
  userId: string,
  dbOrderId: string,
): string {
  return `vip_${userId}_${dbOrderId}_${Date.now()}`;
}

export function parseVipNowPaymentsOrderId(
  orderId: string,
): { userId: string; dbOrderId: string } | null {
  const match = orderId.trim().match(VIP_ORDER_RE);
  if (!match) return null;
  return { userId: match[1], dbOrderId: match[2] };
}

/** Legacy checkout passes raw Supabase order UUID. */
export function isUuidOrderId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}
