import { buildClientVpnStatus } from "@/lib/client-vpn";
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

  const status = await buildClientVpnStatus(gate.ctx);
  return vpnJson(request, { status });
}
