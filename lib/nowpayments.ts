import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortObject = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, unknown>, key) => {
      result[key] = sortObject(obj[key]);
      return result;
    }, {});
};

export function verifyNowPaymentsSignature(
  payload: unknown,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  const sorted = sortObject(payload);
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(sorted))
    .digest("hex");
  return hash === signature;
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return url || "http://localhost:3000";
}

/** NOWPayments IPN statuses that trigger VPN provisioning. */
export const PAID_PAYMENT_STATUSES = new Set(["finished", "confirmed"]);

const PARTIAL_PAYMENT_THRESHOLD = 0.95;

export type PaymentAcceptance =
  | "fulfill"
  | "underpaid"
  | "ignored"
  | "failed";

export function extractPaymentMeta(payload: Record<string, unknown>) {
  const paymentStatus =
    typeof payload.payment_status === "string"
      ? payload.payment_status.toLowerCase()
      : "";

  const actuallyPaid = Number(payload.actually_paid ?? 0);
  const payAmount = Number(payload.pay_amount ?? 0);

  const paymentCurrency =
    typeof payload.pay_currency === "string" ? payload.pay_currency : null;

  const txHash =
    (typeof payload.payin_hash === "string" && payload.payin_hash) ||
    (typeof payload.network_hash === "string" && payload.network_hash) ||
    null;

  return {
    paymentStatus,
    actuallyPaid,
    payAmount,
    paymentCurrency,
    txHash,
  };
}

export function evaluatePaymentAcceptance(
  payload: Record<string, unknown>,
): PaymentAcceptance {
  const { paymentStatus, actuallyPaid, payAmount } = extractPaymentMeta(payload);

  if (paymentStatus === "failed" || paymentStatus === "expired" || paymentStatus === "refunded") {
    return "failed";
  }

  if (PAID_PAYMENT_STATUSES.has(paymentStatus)) {
    return "fulfill";
  }

  if (paymentStatus === "partially_paid") {
    if (!payAmount || payAmount <= 0) return "underpaid";
    if (actuallyPaid / payAmount >= PARTIAL_PAYMENT_THRESHOLD) {
      return "fulfill";
    }
    return "underpaid";
  }

  return "ignored";
}
