import {
  findProxyProduct,
  type ProxyCategory,
  type ProxyProduct,
} from "@/lib/proxy-catalog";

export type ProxyPricingTier = {
  id: string;
  name: string;
  description: string;
  unitPriceUsd: number;
  unitLabel?: string;
  minQty: number;
  maxQty: number;
  defaultQty: number;
  badge?: string;
};

export type ProxyAddon = {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  priceType: "flat" | "per_unit" | "per_month";
};

export type ProxyProductDetail = {
  product: ProxyProduct;
  tiers: ProxyPricingTier[];
  addons: ProxyAddon[];
  highlights: string[];
  useCases: string[];
};

const COMMON_ADDONS: ProxyAddon[] = [
  {
    id: "geo-premium",
    name: "Premium GEO pack",
    description: "City/state-level targeting for US, UK, DE, FR, ES",
    priceUsd: 19,
    priceType: "flat",
  },
  {
    id: "priority-provision",
    name: "Priority provisioning",
    description: "Delivery within 4 business hours",
    priceUsd: 29,
    priceType: "flat",
  },
  {
    id: "replacement-sla",
    name: "48h replacement SLA",
    description: "One free IP/credential swap per month",
    priceUsd: 15,
    priceType: "per_month",
  },
  {
    id: "api-access",
    name: "REST API + webhook",
    description: "Programmatic rotation control and usage stats",
    priceUsd: 12,
    priceType: "per_month",
  },
  {
    id: "subusers",
    name: "Team sub-users (×5)",
    description: "Isolated credentials for media buyers or devs",
    priceUsd: 9,
    priceType: "per_unit",
  },
];

const CATEGORY_ADDONS: Partial<Record<ProxyCategory, ProxyAddon[]>> = {
  residential: [
    {
      id: "sticky-extend",
      name: "Extended sticky session",
      description: "60-minute sticky TTL instead of default 10–30 min",
      priceUsd: 8,
      priceType: "per_month",
    },
    {
      id: "clean-pool",
      name: "Clean fraud-score pool",
      description: "Pre-screened IPs for ads & checkout flows",
      priceUsd: 22,
      priceType: "flat",
    },
  ],
  mobile: [
    {
      id: "carrier-pick",
      name: "Carrier ASN selection",
      description: "Choose Verizon, T-Mobile, Vodafone, etc.",
      priceUsd: 35,
      priceType: "flat",
    },
  ],
  isp: [
    {
      id: "adspower-template",
      name: "AdsPower import template",
      description: "Pre-filled SOCKS profile for your GEO",
      priceUsd: 0,
      priceType: "flat",
    },
  ],
  fleet: [
    {
      id: "dedicated-manager",
      name: "Dedicated account manager",
      description: "Slack/Telegram channel with 4h response SLA",
      priceUsd: 99,
      priceType: "per_month",
    },
  ],
};

function isBandwidthProduct(p: ProxyProduct): boolean {
  return p.unitLabel.toLowerCase().includes("gb");
}

function isRequestProduct(p: ProxyProduct): boolean {
  return p.unitLabel.toLowerCase().includes("request");
}

function buildBandwidthTiers(p: ProxyProduct): ProxyPricingTier[] {
  const base = p.priceUsd;
  return [
    {
      id: "flex",
      name: "Pay-as-you-go",
      description: "No minimum commitment — scale anytime",
      unitPriceUsd: base,
      unitLabel: p.unitLabel,
      minQty: p.minQty,
      maxQty: p.maxQty,
      defaultQty: p.defaultQty,
    },
    {
      id: "volume-50",
      name: "Volume · 50+ GB",
      description: "15% lower unit rate when ordering 50 GB or more",
      unitPriceUsd: Math.round(base * 0.85 * 100) / 100,
      unitLabel: p.unitLabel,
      minQty: Math.max(50, p.minQty),
      maxQty: p.maxQty,
      defaultQty: 50,
      badge: "Save 15%",
    },
    {
      id: "volume-200",
      name: "Volume · 200+ GB",
      description: "25% lower unit rate for high-volume operators",
      unitPriceUsd: Math.round(base * 0.75 * 100) / 100,
      unitLabel: p.unitLabel,
      minQty: Math.max(200, p.minQty),
      maxQty: p.maxQty,
      defaultQty: 200,
      badge: "Save 25%",
    },
  ];
}

function buildUnitTiers(p: ProxyProduct): ProxyPricingTier[] {
  const base = p.priceUsd;
  const min = p.minQty;
  const max = p.maxQty;
  return [
    {
      id: "standard",
      name: "Standard unit",
      description: `Single ${p.unitLabel} — full list price`,
      unitPriceUsd: base,
      unitLabel: p.unitLabel,
      minQty: min,
      maxQty: max,
      defaultQty: p.defaultQty,
    },
    {
      id: "bundle-5",
      name: "5-unit bundle",
      description: "10% off per unit when ordering 5 or more",
      unitPriceUsd: Math.round(base * 0.9 * 100) / 100,
      unitLabel: p.unitLabel,
      minQty: Math.max(5, min),
      maxQty: max,
      defaultQty: Math.max(5, p.defaultQty),
      badge: "−10%",
    },
    {
      id: "bundle-10",
      name: "10-unit bundle",
      description: "18% off per unit for teams running multiple profiles",
      unitPriceUsd: Math.round(base * 0.82 * 100) / 100,
      unitLabel: p.unitLabel,
      minQty: Math.max(10, min),
      maxQty: max,
      defaultQty: Math.max(10, p.defaultQty),
      badge: "−18%",
    },
  ];
}

function buildEnterpriseTiers(p: ProxyProduct): ProxyPricingTier[] {
  return [
    {
      id: "node-standard",
      name: "Dedicated node",
      description: p.description,
      unitPriceUsd: p.priceUsd,
      unitLabel: p.unitLabel,
      minQty: p.minQty,
      maxQty: p.maxQty,
      defaultQty: p.defaultQty,
    },
    {
      id: "node-ha",
      name: "HA failover pair",
      description: "Active-passive second node in alternate GEO",
      unitPriceUsd: Math.round(p.priceUsd * 1.65 * 100) / 100,
      unitLabel: p.unitLabel,
      minQty: 1,
      maxQty: 3,
      defaultQty: 1,
      badge: "HA",
    },
  ];
}

function buildTiers(p: ProxyProduct): ProxyPricingTier[] {
  if (p.category === "fleet" && p.priceUsd >= 100) {
    return buildEnterpriseTiers(p);
  }
  if (isBandwidthProduct(p) || isRequestProduct(p)) {
    return buildBandwidthTiers(p);
  }
  return buildUnitTiers(p);
}

function buildAddons(p: ProxyProduct): ProxyAddon[] {
  const extra = CATEGORY_ADDONS[p.category] ?? [];
  const merged = [...COMMON_ADDONS, ...extra];
  const seen = new Set<string>();
  return merged.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

const USE_CASES: Record<ProxyCategory, string[]> = {
  residential: [
    "Ad verification & brand safety",
    "Web scraping at scale",
    "Anti-detect browser farms",
  ],
  datacenter: [
    "QA automation & load tests",
    "Price monitoring",
    "High-concurrency crawlers",
  ],
  mobile: [
    "Social & banking app testing",
    "Mobile ad fraud detection",
    "App-store geo validation",
  ],
  isp: [
    "AdsPower / Dolphin Anty profiles",
    "Long-session media buying",
    "E-commerce multi-store ops",
  ],
  socks5: [
    "SOCKS-aware scrapers",
    "UDP-capable tooling",
    "Legacy stack compatibility",
  ],
  http: [
    "Browser HTTP proxies",
    "Legacy CONNECT clients",
    "Corporate egress testing",
  ],
  ipv6: [
    "IPv6-only target testing",
    "Large address-space crawls",
    "Dual-stack validation",
  ],
  fleet: [
    "Enterprise proxy nodes",
    "Managed unlocker pipelines",
    "Custom GEO contract pools",
  ],
};

export function getProxyProductDetail(productId: string): ProxyProductDetail | null {
  const product = findProxyProduct(productId);
  if (!product) return null;

  return {
    product,
    tiers: buildTiers(product),
    addons: buildAddons(product),
    highlights: product.features,
    useCases: USE_CASES[product.category],
  };
}

export function findProxyTier(
  detail: ProxyProductDetail,
  tierId: string,
): ProxyPricingTier | null {
  return detail.tiers.find((t) => t.id === tierId) ?? null;
}

export function findProxyAddons(
  detail: ProxyProductDetail,
  addonIds: string[],
): ProxyAddon[] {
  const set = new Set(addonIds);
  return detail.addons.filter((a) => set.has(a.id));
}
