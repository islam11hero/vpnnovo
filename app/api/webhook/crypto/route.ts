import { NextResponse } from "next/server";

import { secureCompareStrings } from "@/lib/secure-compare";

/**
 * Legacy webhook — disabled unless CRYPTO_WEBHOOK_SECRET is set and sent via
 * `x-webhook-secret` header. Prefer /api/webhook/nowpay with signature verification.
 */
export async function POST(request: Request) {
  const secret = process.env.CRYPTO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Crypto webhook is disabled" },
      { status: 410 },
    );
  }

  const headerSecret = request.headers.get("x-webhook-secret") ?? "";
  if (!secureCompareStrings(headerSecret, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Legacy crypto webhook is retired. Use NOWPayments IPN at /api/webhook/nowpay.",
    },
    { status: 410 },
  );
}
