import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/json-error";
import { getAppUrl } from "@/lib/app-url";
import { buildProxyPlanName, findProxyProduct } from "@/lib/proxy-catalog";
import {
  calcProxyOrderQuote,
  formatProxyOrderNote,
} from "@/lib/proxy-order-pricing";
import {
  findProxyAddons,
  findProxyTier,
  getProxyProductDetail,
} from "@/lib/proxy-product-config";
import { createAppNowPaymentsInvoice } from "@/lib/nowpayments-invoice-app";
import { buildVipNowPaymentsOrderId } from "@/lib/nowpayments-order-id";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";
import { isValidUuid } from "@/lib/uuid";

export const dynamic = "force-dynamic";

type CheckoutBody = {
  productId?: string;
  tierId?: string;
  addonIds?: string[];
  quantity?: number;
  geoRequest?: string;
  clientNote?: string;
  durationDays?: number;
  vaultOrderId?: string;
};

function readCheckoutBody(body: unknown): CheckoutBody {
  if (typeof body !== "object" || body === null) return {};
  const b = body as Record<string, unknown>;
  return {
    productId: typeof b.productId === "string" ? b.productId.trim() : undefined,
    tierId: typeof b.tierId === "string" ? b.tierId.trim() : undefined,
    addonIds: Array.isArray(b.addonIds)
      ? b.addonIds.filter((id): id is string => typeof id === "string")
      : undefined,
    quantity: typeof b.quantity === "number" ? b.quantity : undefined,
    geoRequest:
      typeof b.geoRequest === "string" ? b.geoRequest.trim().slice(0, 200) : "",
    clientNote:
      typeof b.clientNote === "string" ? b.clientNote.trim().slice(0, 500) : "",
    durationDays:
      typeof b.durationDays === "number" ? Math.floor(b.durationDays) : 30,
    vaultOrderId:
      typeof b.vaultOrderId === "string" ? b.vaultOrderId.trim() : undefined,
  };
}

export async function POST(request: Request) {
  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = readCheckoutBody(body);
  const product = findProxyProduct(parsed.productId ?? "");
  if (!product) {
    return jsonError("Invalid proxy product", 400);
  }

  const detail = getProxyProductDetail(product.id);
  if (!detail) {
    return jsonError("Invalid proxy product", 400);
  }

  const tier =
    findProxyTier(detail, parsed.tierId ?? "") ?? detail.tiers[0] ?? null;
  if (!tier) {
    return jsonError("Invalid pricing tier", 400);
  }

  const addons = findProxyAddons(detail, parsed.addonIds ?? []);
  const durationDays = Math.max(
    1,
    Math.min(365, parsed.durationDays ?? 30),
  );
  const quantity = Number.isFinite(parsed.quantity)
    ? (parsed.quantity as number)
    : tier.defaultQty;

  const quote = calcProxyOrderQuote({
    product,
    tier,
    quantity,
    durationDays,
    addons,
  });

  if (quote.totalUsd < 1) {
    return jsonError("Order amount too low", 400);
  }

  const amountUsd = quote.totalUsd;
  const structuredNote = formatProxyOrderNote({
    tierName: tier.name,
    quantity: quote.quantity,
    unitLabel: tier.unitLabel ?? product.unitLabel,
    durationDays,
    addonNames: addons.map((a) => a.name),
    geoRequest: parsed.geoRequest ?? "",
    userNote: parsed.clientNote ?? "",
  });

  const supabase = createSupabaseServerClient();
  const authUser = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  const vaultOrderId = parsed.vaultOrderId ?? "";
  if (!authUser && !isValidUuid(vaultOrderId)) {
    return jsonError("Open your portal or sign in to order proxies", 401);
  }

  let vaultOrder: { id: string; user_id: string | null; status: string } | null =
    null;
  if (isValidUuid(vaultOrderId)) {
    const { data, error } = await db.client
      .from("orders")
      .select("id, user_id, status")
      .eq("id", vaultOrderId)
      .maybeSingle();
    if (error || !data) {
      return jsonError("Vault order not found", 404);
    }
    vaultOrder = data as { id: string; user_id: string | null; status: string };
    if (authUser && vaultOrder.user_id && vaultOrder.user_id !== authUser.id) {
      return jsonError("This vault does not belong to your account", 403);
    }
  }

  const ownerUserId =
    authUser?.id ?? vaultOrder?.user_id?.trim() ?? null;
  const linkVaultId = vaultOrder?.id ?? null;
  const nowpaymentsAnchor = ownerUserId ?? linkVaultId ?? "";

  if (!nowpaymentsAnchor) {
    return jsonError("Could not resolve order context", 400);
  }

  const planName = `${buildProxyPlanName(product)} — ${tier.name}`;
  const qty = quote.quantity;

  const { data: paymentOrder, error: insertOrderError } = await db.client
    .from("orders")
    .insert({
      plan_name: planName,
      amount: amountUsd,
      status: "pending",
      is_renewal: false,
      user_id: ownerUserId,
      payment_provider: "nowpayments",
    })
    .select("id")
    .single();

  if (insertOrderError || !paymentOrder?.id) {
    return jsonError("Could not create payment order", 500);
  }

  const paymentOrderId = paymentOrder.id as string;

  const { error: proxyInsertError } = await db.client.from("proxy_orders").insert({
    user_id: ownerUserId,
    vault_order_id: linkVaultId,
    payment_order_id: paymentOrderId,
    product_id: product.id,
    product_name: `${product.name} · ${tier.name}`,
    proxy_type: product.category,
    protocol: product.protocol,
    quantity: qty,
    duration_days: durationDays,
    geo_request: parsed.geoRequest || null,
    amount_usd: amountUsd,
    status: "pending",
    client_note: structuredNote,
  });

  if (proxyInsertError) {
    await db.client.from("orders").delete().eq("id", paymentOrderId);
    const msg = proxyInsertError.message;
    if (msg.includes("proxy_orders") || msg.includes("vault_order_id")) {
      return jsonError(
        "Proxy orders table needs migration — run 20260527_proxy_orders.sql and 20260528_proxy_orders_vault.sql in Supabase",
        500,
      );
    }
    return jsonError("Could not create proxy order", 500);
  }

  const nowpaymentsOrderId = buildVipNowPaymentsOrderId(
    nowpaymentsAnchor,
    paymentOrderId,
  );

  const successPath = linkVaultId
    ? `/portal/${linkVaultId}?proxy=success`
    : "/dashboard?proxy=success";

  try {
    const appUrl = getAppUrl();
    const invoice_url = await createAppNowPaymentsInvoice({
      nowpaymentsOrderId,
      amount: amountUsd,
      description: `IPNOVA Proxy — ${product.name} (${tier.name})`,
      successPath,
    });

    return NextResponse.json({
      success: true,
      invoice_url,
      order_id: paymentOrderId,
      amount_usd: amountUsd,
      nowpayments_order_id: nowpaymentsOrderId,
      ipn_callback_url: `${appUrl}/api/webhooks/nowpayments`,
    });
  } catch (e) {
    await db.client.from("orders").update({ status: "failed" }).eq("id", paymentOrderId);
    await db.client
      .from("proxy_orders")
      .update({ status: "failed" })
      .eq("payment_order_id", paymentOrderId);
    return jsonError(
      e instanceof Error ? e.message : "Invoice creation failed",
      502,
    );
  }
}
