export function resolvePortalUrl(orderId: string, origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/portal/${orderId}`;
}

export function resolveMagicLoginUrl(accessCode: string, origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/login?key=${accessCode}`;
}

export function buildVipHandoffClipboardText(input: {
  accessCode: string;
  subLink: string;
  username: string;
  origin: string;
}): string {
  const base = input.origin.replace(/\/$/, "");
  const loginUrl = resolveMagicLoginUrl(input.accessCode, base);
  const portalUrl = resolvePortalUrl(input.accessCode, base);
  return [
    "IPNOVA VIP Handoff",
    `Username: ${input.username}`,
    `Access Code (Order ID): ${input.accessCode}`,
    `Magic Login: ${loginUrl}`,
    `Instant Portal: ${portalUrl}`,
    `Dashboard (after login): ${base}/dashboard`,
    `Subscription: ${input.subLink}`,
  ].join("\n");
}
