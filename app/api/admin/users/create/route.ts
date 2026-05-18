import { NextResponse } from "next/server";

import { provisionFreeVipClientAction } from "@/actions/admin-vip-provision";
import { VIP_FREE_PLAN_NAME } from "@/lib/vip-constants";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const username =
    typeof body === "object" &&
    body !== null &&
    "username" in body &&
    typeof (body as { username: unknown }).username === "string"
      ? (body as { username: string }).username.trim()
      : "";

  const months =
    typeof body === "object" &&
    body !== null &&
    "months" in body &&
    typeof (body as { months: unknown }).months === "number"
      ? (body as { months: number }).months
      : 1;

  const data_limit_gb =
    typeof body === "object" &&
    body !== null &&
    "data_limit_gb" in body &&
    typeof (body as { data_limit_gb: unknown }).data_limit_gb === "number"
      ? (body as { data_limit_gb: number }).data_limit_gb
      : 100;

  if (!username) {
    return jsonError("Username is required", 400);
  }

  const result = await provisionFreeVipClientAction({
    username,
    months,
    dataLimitGb: data_limit_gb,
  });

  if (!result.success) {
    return jsonError("error" in result ? result.error : "Provisioning failed", 502);
  }
  if (!result.data) {
    return jsonError("Provisioning failed", 502);
  }

  return NextResponse.json({
    success: true,
    order_id: result.data.orderId,
    vpn_username: result.data.username,
    client_link: result.data.clientLink,
    sub_link: result.data.subLink,
    plan_name: VIP_FREE_PLAN_NAME,
  });
}
