import { NextResponse } from "next/server";

import {
  nowPaymentsIpnToResponse,
  processNowPaymentsIpn,
} from "@/lib/nowpayments-ipn-handler";
import { verifyNowPaymentsSignature } from "@/lib/nowpayments";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Legacy NOWPayments callback — delegates to unified IPN handler. */
export async function POST(request: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    console.error("[nowpay IPN] NOWPAYMENTS_IPN_SECRET is not configured");
    return NextResponse.json({ error: "IPN not configured" }, { status: 500 });
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const signature = request.headers.get("x-nowpayments-sig");
  if (!verifyNowPaymentsSignature(payload, signature, ipnSecret)) {
    console.error("[nowpay IPN] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await processNowPaymentsIpn(db.client, payload, "[nowpay IPN]");
  return nowPaymentsIpnToResponse(result);
}
