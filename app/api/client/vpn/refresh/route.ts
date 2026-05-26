import { jsonError } from "@/lib/api/json-error";
import { withCors } from "@/lib/api/cors";
import {
  buildClientVpnProfile,
  refreshClientVpnSubscription,
} from "@/lib/client-vpn";
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

export async function POST(request: Request) {
  const gate = await requireVpnContext(request);
  if (!gate.ok) return gate.response;

  try {
    const node = new URL(request.url).searchParams.get("node");
    const subscriptionUrl = await refreshClientVpnSubscription(gate.ctx);
    const profile = await buildClientVpnProfile(
      {
        ...gate.ctx,
        subscriptionUrl,
      },
      node,
    );

    return vpnJson(request, {
      subscriptionRefreshed: true,
      profile,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to refresh subscription";
    return withCors(request, jsonError(message, 502));
  }
}
