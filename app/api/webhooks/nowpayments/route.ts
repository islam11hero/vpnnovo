import { NextResponse } from "next/server";

import {
  nowPaymentsIpnToResponse,
  processNowPaymentsIpn,
} from "@/lib/nowpayments-ipn-handler";
import { verifyNowPaymentsSignature } from "@/lib/nowpayments";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    console.error("[nowpayments IPN] NOWPAYMENTS_IPN_SECRET is not configured");
    return NextResponse.json({ received: true, error: "not_configured" });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ received: true, error: "invalid_body" });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ received: true, error: "invalid_json" });
  }

  const signature = request.headers.get("x-nowpayments-sig");
  if (!verifyNowPaymentsSignature(payload, signature, ipnSecret)) {
    console.error("[nowpayments IPN] Invalid HMAC signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    console.error("[nowpayments IPN] Supabase admin unavailable");
    return NextResponse.json({ received: true, error: "db_unavailable" });
  }

  const result = await processNowPaymentsIpn(db.client, payload);
  return nowPaymentsIpnToResponse(result);
}
