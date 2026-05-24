import { getAppUrl } from "@/lib/app-url";

export type CreateAppInvoiceParams = {
  /** External NOWPayments order_id (e.g. vip_{userId}_{dbOrderId}_{ts}). */
  nowpaymentsOrderId: string;
  amount: number;
  description: string;
  successPath?: string;
};

/**
 * Creates a NOWPayments invoice with per-app IPN override (bypasses dashboard default).
 */
export async function createAppNowPaymentsInvoice(
  params: CreateAppInvoiceParams,
): Promise<string> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error("NOWPayments API key is not configured");
  }

  const appUrl = getAppUrl();
  const ipn_callback_url = `${appUrl}/api/webhooks/nowpayments`;
  const success_url = params.successPath
    ? `${appUrl}${params.successPath.startsWith("/") ? params.successPath : `/${params.successPath}`}`
    : `${appUrl}/dashboard?payment=success`;
  const cancel_url = `${appUrl}/pricing`;

  const invoicePayload = {
    price_amount: params.amount,
    price_currency: "usd",
    order_id: params.nowpaymentsOrderId,
    order_description: params.description,
    ipn_callback_url,
    success_url,
    cancel_url,
  };

  const invoiceRes = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoicePayload),
    cache: "no-store",
  });

  if (!invoiceRes.ok) {
    const errText = await invoiceRes.text();
    throw new Error(`NOWPayments invoice failed: ${errText.slice(0, 500)}`);
  }

  const invoice = (await invoiceRes.json()) as { invoice_url?: string };
  if (!invoice.invoice_url) {
    throw new Error("NOWPayments returned no invoice URL");
  }

  return invoice.invoice_url;
}
