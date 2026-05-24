import { getSiteUrl } from "@/lib/nowpayments";

export async function createNowPaymentsInvoice(params: {
  orderId: string;
  amount: number;
  planName: string;
  description?: string;
}): Promise<string> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error("NOWPayments API key is not configured");
  }

  const siteUrl = getSiteUrl();
  const description =
    params.description ?? `IPNOVA VPN - ${params.planName}`;

  const invoiceRes = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: params.amount,
      price_currency: "usd",
      order_id: params.orderId,
      order_description: description,
      ipn_callback_url: `${siteUrl}/api/webhooks/nowpayments`,
      success_url: `${siteUrl}/portal/${params.orderId}`,
      cancel_url: `${siteUrl}/`,
    }),
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
