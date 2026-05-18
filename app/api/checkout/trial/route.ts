import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { MarzbanError, provisionTrialMarzbanUser } from "@/lib/marzban";
import { supabaseAdmin } from "@/lib/supabase";
import {
  extractClientIp,
  hasTrialAbuseRecord,
  normalizeDeviceHash,
  recordTrialClaim,
  TRIAL_CLAIMED_COOKIE,
  TRIAL_FRAUD_MESSAGE,
} from "@/lib/trial-abuse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRIAL_PLAN_NAME = "24-Hour Stealth Trial";
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

function fraudResponse() {
  return jsonError(TRIAL_FRAUD_MESSAGE, 429, { fraud: true });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  if (cookieStore.get(TRIAL_CLAIMED_COOKIE)?.value === "true") {
    return fraudResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const deviceHash = normalizeDeviceHash(
    typeof body === "object" && body !== null && "deviceHash" in body
      ? (body as { deviceHash: unknown }).deviceHash
      : null,
  );

  if (!deviceHash) {
    return jsonError("Missing or invalid device fingerprint", 400);
  }

  const ipAddress = extractClientIp(request);

  try {
    const blocked = await hasTrialAbuseRecord(ipAddress, deviceHash);
    if (blocked) {
      return fraudResponse();
    }
  } catch (e) {
    console.error("[trial] abuse check failed:", e);
    return jsonError("Trial security check unavailable. Try again later.", 503);
  }

  if (!supabaseAdmin) {
    return jsonError("Supabase admin client is not configured", 500);
  }

  const { data: order, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
      plan_name: TRIAL_PLAN_NAME,
      amount: 0,
      status: "paid",
      is_renewal: false,
    })
    .select("id")
    .single();

  if (insertError || !order?.id) {
    return jsonError(
      insertError?.message ?? "Failed to create trial order in Supabase",
      500,
    );
  }

  const orderId = order.id as string;

  try {
    const { username, sub_link } = await provisionTrialMarzbanUser(orderId);

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        vpn_username: username,
        vpn_sub_link: sub_link,
      })
      .eq("id", orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    try {
      await recordTrialClaim({ ipAddress, deviceHash, orderId });
    } catch (logError) {
      console.error("[trial] TrialLog insert failed:", logError);
    }

    const response = NextResponse.json({ success: true, order_id: orderId });
    response.cookies.set(TRIAL_CLAIMED_COOKIE, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
    return response;
  } catch (e) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);

    if (e instanceof MarzbanError) {
      return jsonError(e.message, e.status);
    }
    return jsonError(
      e instanceof Error ? e.message : "Trial provisioning failed",
      502,
    );
  }
}
