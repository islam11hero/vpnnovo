import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/json-error";
import { MarzbanError, provisionTrialMarzbanUser } from "@/lib/marzban";
import { updateOrderVpnFields } from "@/lib/order-vpn-update";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";
import {
  hasTrialAbuseRecord,
  normalizeDeviceHash,
  recordTrialClaim,
  TRIAL_CLAIMED_COOKIE,
  TRIAL_FRAUD_MESSAGE,
} from "@/lib/trial-abuse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRIAL_PLAN_NAME = "24-Hour Stealth Trial";
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

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

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "unknown";

  try {
    const blocked = await hasTrialAbuseRecord(ipAddress, deviceHash);
    if (blocked) {
      return fraudResponse();
    }
  } catch (e) {
    console.error("[trial] abuse check failed:", e);
    return jsonError("Trial security check unavailable. Try again later.", 503);
  }

  const { data: order, error: insertError } = await db.client
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
    return jsonError("Could not create trial. Please try again.", 500);
  }

  const orderId = order.id as string;

  try {
    const { username, sub_link } = await provisionTrialMarzbanUser(orderId);

    const updateResult = await updateOrderVpnFields(db.client, orderId, {
      username,
      subLink: sub_link,
      status: "paid",
    });

    if (!updateResult.ok) {
      throw new Error(updateResult.error);
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
    await db.client
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
