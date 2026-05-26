import "server-only";

import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/lib/api/cors";
import { jsonError } from "@/lib/api/json-error";
import { resolveClientVpnUser } from "@/lib/client-vpn-auth";
import { loadClientVpnContext } from "@/lib/client-vpn";

export function handleVpnOptions(request: Request): NextResponse {
  return corsPreflight(request);
}

export async function requireVpnContext(request: Request) {
  const auth = await resolveClientVpnUser(request);
  if (!auth.ok) {
    return {
      ok: false as const,
      response: withCors(request, jsonError(auth.error, auth.status)),
    };
  }

  const ctx = await loadClientVpnContext(auth.user);
  if (!ctx) {
    return {
      ok: false as const,
      response: withCors(
        request,
        jsonError(
          "No active VPN subscription linked to this account",
          404,
          {
            reasonAr:
              "لا توجد باقة نشطة — اشترِ باقة أو سجّل الدخول بعد إتمام الشراء على الموقع",
            hint: "Complete checkout or link your order from the dashboard",
          },
        ),
      ),
    };
  }

  return { ok: true as const, ctx, user: auth.user };
}

export function vpnJson(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return withCors(
    request,
    NextResponse.json({ success: true, ...body }, { status }),
  );
}
