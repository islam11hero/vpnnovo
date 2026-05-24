/** Nord-style B2C tiers — annual USD (crypto-friendly minimums). */
export const B2C_TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: 59.88,
    popular: false,
    features: [
      "Secure VPN connection",
      "Threat Protection Lite",
      "1 device",
      "Standard global nodes",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 65.88,
    popular: true,
    features: [
      "Secure VPN connection",
      "Threat Protection Pro",
      "Malware & tracker blocker",
      "Up to 10 devices",
      "Dark Web Monitor",
    ],
  },
  {
    id: "complete",
    name: "Complete",
    price: 83.88,
    popular: false,
    features: [
      "Everything in Plus",
      "Dedicated clean ISP egress",
      "Priority routing",
      "Up to 10 devices",
      "24/7 priority support",
    ],
  },
] as const;

/** High-ticket proxy / fleet tiers (monthly USD). */
export const PROXY_TIERS: Array<{
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
}> = [
  {
    id: "adspower-solo",
    name: "AdsPower Solo",
    price: 49,
    features: [
      "1 Clean ISP IP",
      "SOCKS5 authenticated",
      "AdsPower / Dolphin ready",
      "Email support",
    ],
  },
  {
    id: "media-fleet",
    name: "Media Buyer Fleet",
    price: 149,
    popular: true,
    features: [
      "5 Clean ISP IPs",
      "Auto-rotation & session isolation",
      "Multi-account isolation",
      "Priority provisioning",
    ],
  },
  {
    id: "enterprise-node",
    name: "Enterprise Node",
    price: 399,
    features: [
      "Dedicated bare-metal node",
      "Unlimited threads",
      "Custom GEO pools",
      "Dedicated account manager",
    ],
  },
] as const;

export type B2CTierId = (typeof B2C_TIERS)[number]["id"];
export type ProxyTierId = (typeof PROXY_TIERS)[number]["id"];

export function resolveMarketingPlanName(
  tier: "b2c" | "proxy",
  tierId: string,
): string | null {
  if (tier === "b2c") {
    const found = B2C_TIERS.find((t) => t.id === tierId);
    return found ? `IPNOVA ${found.name} (Annual)` : null;
  }
  const found = PROXY_TIERS.find((t) => t.id === tierId);
  return found ? found.name : null;
}

export function resolveMarketingPlanPrice(
  tier: "b2c" | "proxy",
  tierId: string,
): number | null {
  const list = tier === "b2c" ? B2C_TIERS : PROXY_TIERS;
  const found = list.find((t) => t.id === tierId);
  return found?.price ?? null;
}
