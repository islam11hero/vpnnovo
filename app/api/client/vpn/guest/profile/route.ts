import { NextResponse } from "next/server";

import { withCors } from "@/lib/api/cors";
import { handleVpnOptions } from "@/lib/client-vpn-route";
import {
  guestError,
  guestJson,
  requireGuestContext,
} from "@/lib/client-guest-route";
import { buildGuestVpnProfile } from "@/lib/client-guest-vpn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleVpnOptions(request);
}

export async function GET(request: Request) {
  const gate = await requireGuestContext(request);
  if (!gate.ok) return gate.response;

  try {
    const node = new URL(request.url).searchParams.get("node");
    const profile = await buildGuestVpnProfile(gate.ctx, node);

    if (!profile.eligibility.canConnect) {
      return withCors(
        request,
        NextResponse.json(
          {
            success: false,
            error:
              profile.eligibility.reason ??
              profile.eligibility.reasonAr ??
              "Free day ended — create an account or buy a plan",
            eligibility: profile.eligibility,
            expired: true,
          },
          { status: 403 },
        ),
      );
    }

    return guestJson(request, { profile, isGuest: true });
  } catch (e) {
    return guestError(request, e);
  }
}
