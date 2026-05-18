import { NextResponse } from "next/server";

import { MarzbanError, revokeAndRefreshMarzbanSubscription } from "@/lib/marzban";
import { isValidUuid } from "@/lib/uuid";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return jsonError("Database not configured", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const order_id =
    typeof body === "object" &&
    body !== null &&
    "order_id" in body &&
    typeof (body as { order_id: unknown }).order_id === "string"
      ? (body as { order_id: string }).order_id.trim()
      : "";

  if (!isValidUuid(order_id)) {
    return jsonError("Invalid or missing order_id", 400);
  }

  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, status, vpn_username")
    .eq("id", order_id)
    .maybeSingle();

  if (fetchError || !order) {
    return jsonError("Order not found", 404);
  }

  if (order.status !== "paid") {
    return jsonError("Only active paid shields can revoke credentials", 400);
  }

  const vpnUsername = order.vpn_username as string | null;
  if (!vpnUsername) {
    return jsonError("VPN user not provisioned yet", 400);
  }

  try {
    const new_link = await revokeAndRefreshMarzbanSubscription(vpnUsername);

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ vpn_sub_link: new_link })
      .eq("id", order_id);

    if (updateError) {
      return jsonError(updateError.message, 500);
    }

    return NextResponse.json({ success: true, new_link });
  } catch (e) {
    if (e instanceof MarzbanError) {
      return jsonError(e.message, e.status);
    }
    return jsonError(
      e instanceof Error ? e.message : "Revoke failed",
      502,
    );
  }
}
