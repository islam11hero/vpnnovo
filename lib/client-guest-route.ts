import "server-only";

import { NextResponse } from "next/server";

import { withCors } from "@/lib/api/cors";
import { jsonError } from "@/lib/api/json-error";
import { MarzbanError } from "@/lib/marzban-error";
import { guestContextFromOrder, resolveGuestOrder } from "@/lib/client-guest-vpn";
import { normalizeDeviceHash } from "@/lib/trial-abuse";

export async function requireGuestContext(request: Request) {
  const orderId = request.headers.get("x-guest-order-id")?.trim() ?? "";
  const deviceHash = normalizeDeviceHash(
    request.headers.get("x-guest-device-hash"),
  );

  if (!orderId || !deviceHash) {
    return {
      ok: false as const,
      response: withCors(
        request,
        jsonError("Guest session incomplete — restart the app", 401),
      ),
    };
  }

  const order = await resolveGuestOrder(orderId, deviceHash);
  if (!order) {
    return {
      ok: false as const,
      response: withCors(
        request,
        jsonError(
          "Trial session expired — a new free day will start automatically",
          403,
        ),
      ),
    };
  }

  return {
    ok: true as const,
    ctx: guestContextFromOrder(order),
    orderId,
    deviceHash,
  };
}

export function guestJson(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return withCors(
    request,
    NextResponse.json({ success: true, ...body }, { status }),
  );
}

export function guestError(request: Request, e: unknown): NextResponse {
  if (e instanceof MarzbanError) {
    return withCors(
      request,
      jsonError(e.message, e.status),
    );
  }
  const message = e instanceof Error ? e.message : "Guest VPN error";
  return withCors(request, jsonError(message, 502));
}
