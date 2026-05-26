import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/json-error";
import { withCors } from "@/lib/api/cors";
import { buildClientVpnProfile } from "@/lib/client-vpn";
import {
  handleVpnOptions,
  requireVpnContext,
  vpnJson,
} from "@/lib/client-vpn-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleVpnOptions(request);
}

export async function GET(request: Request) {
  const gate = await requireVpnContext(request);
  if (!gate.ok) return gate.response;

  try {
    const node = new URL(request.url).searchParams.get("node");
    const profile = await buildClientVpnProfile(gate.ctx, node);

    if (!profile.eligibility.canConnect) {
      return withCors(
        request,
        NextResponse.json(
          {
            success: false,
            error: profile.eligibility.reason ?? "Cannot connect",
            reasonAr: profile.eligibility.reasonAr,
            eligibility: profile.eligibility,
            orderId: profile.orderId,
            marzbanUsername: profile.marzbanUsername,
          },
          { status: 403 },
        ),
      );
    }

    return vpnJson(request, {
      profile,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load VPN profile";
    return withCors(request, jsonError(message, 502));
  }
}
