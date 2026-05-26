import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/lib/api/cors";
import { jsonError } from "@/lib/api/json-error";
import { resolveClientVpnUser } from "@/lib/client-vpn-auth";
import { linkPaidOrderToUser } from "@/lib/link-order";

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const auth = await resolveClientVpnUser(request);
  if (!auth.ok) {
    return withCors(request, jsonError(auth.error, auth.status));
  }
  const user = auth.user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(request, jsonError("Invalid JSON", 400));
  }

  const orderId =
    typeof body === "object" &&
    body !== null &&
    "orderId" in body &&
    typeof (body as { orderId: unknown }).orderId === "string"
      ? (body as { orderId: string }).orderId.trim()
      : "";

  const result = await linkPaidOrderToUser(orderId, user.id);
  if (!result.ok) {
    return withCors(request, jsonError(result.error, result.status));
  }

  return withCors(
    request,
    NextResponse.json({ success: true, orderId: result.orderId }),
  );
}
