import { handleVpnOptions } from "@/lib/client-vpn-route";
import { guestError, guestJson } from "@/lib/client-guest-route";
import { startOrResumeGuestSession } from "@/lib/client-guest-vpn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleVpnOptions(request);
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return guestError(request, new Error("Invalid JSON"));
    }

    const deviceHash =
      typeof body === "object" &&
      body !== null &&
      "deviceHash" in body
        ? (body as { deviceHash: unknown }).deviceHash
        : null;

    const guest = await startOrResumeGuestSession(request, deviceHash);
    return guestJson(request, { guest });
  } catch (e) {
    return guestError(request, e);
  }
}
