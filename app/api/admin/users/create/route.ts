import { NextResponse } from "next/server";

import { MarzbanError, provisionManualMarzbanUser } from "@/lib/marzban";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const plan_name =
    typeof body === "object" &&
    body !== null &&
    "plan_name" in body &&
    typeof (body as { plan_name: unknown }).plan_name === "string"
      ? (body as { plan_name: string }).plan_name.trim()
      : "";

  const months =
    typeof body === "object" &&
    body !== null &&
    "months" in body &&
    typeof (body as { months: unknown }).months === "number"
      ? (body as { months: number }).months
      : NaN;

  const data_limit_gb =
    typeof body === "object" &&
    body !== null &&
    "data_limit_gb" in body &&
    typeof (body as { data_limit_gb: unknown }).data_limit_gb === "number"
      ? (body as { data_limit_gb: number }).data_limit_gb
      : NaN;

  if (!plan_name) {
    return jsonError("Invalid or missing plan_name", 400);
  }

  try {
    const { username, sub_link } = await provisionManualMarzbanUser({
      planName: plan_name,
      months,
      dataLimitGb: data_limit_gb,
    });

    const { data: order, error: insertError } = await db.client
      .from("orders")
      .insert({
        plan_name,
        amount: 0,
        status: "paid",
        vpn_username: username,
        vpn_sub_link: sub_link,
        is_renewal: false,
      })
      .select("id")
      .single();

    if (insertError || !order?.id) {
      return jsonError(
        insertError?.message ?? "Failed to create order in Supabase",
        500,
      );
    }

    return NextResponse.json({
      success: true,
      order_id: order.id as string,
      vpn_username: username,
    });
  } catch (e) {
    if (e instanceof MarzbanError) {
      return jsonError(e.message, e.status);
    }
    return jsonError(
      e instanceof Error ? e.message : "Manual provisioning failed",
      502,
    );
  }
}
