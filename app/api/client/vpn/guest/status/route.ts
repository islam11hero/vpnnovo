import { handleVpnOptions } from "@/lib/client-vpn-route";
import {
  guestError,
  guestJson,
  requireGuestContext,
} from "@/lib/client-guest-route";
import { buildGuestVpnStatus } from "@/lib/client-guest-vpn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleVpnOptions(request);
}

export async function GET(request: Request) {
  const gate = await requireGuestContext(request);
  if (!gate.ok) return gate.response;

  try {
    const status = await buildGuestVpnStatus(gate.ctx);
    return guestJson(request, { status, isGuest: true });
  } catch (e) {
    return guestError(request, e);
  }
}
