/** Proxy IP catalog — manual fulfillment after crypto payment. */

export type ProxyCategory =
  | "residential"
  | "datacenter"
  | "mobile"
  | "isp"
  | "socks5"
  | "http"
  | "ipv6"
  | "fleet";

export type ProxyProduct = {
  id: string;
  name: string;
  category: ProxyCategory;
  protocol: string;
  description: string;
  /** Base price in USD (per unit for the selected billing unit). */
  priceUsd: number;
  unitLabel: string;
  minQty: number;
  maxQty: number;
  defaultQty: number;
  features: string[];
  popular?: boolean;
};

export const PROXY_PLAN_PREFIX = "Proxy · ";

export const PROXY_PRODUCTS: ProxyProduct[] = [
  {
    id: "residential-rotating",
    name: "Residential Rotating",
    category: "residential",
    protocol: "HTTP / SOCKS5",
    description: "Real residential IPs with session rotation for scraping and ad verification.",
    priceUsd: 12,
    unitLabel: "GB",
    minQty: 1,
    maxQty: 500,
    defaultQty: 5,
    features: ["Rotating sessions", "195+ GEOs", "Anti-detect ready"],
  },
  {
    id: "residential-sticky",
    name: "Residential Sticky",
    category: "residential",
    protocol: "HTTP / SOCKS5",
    description: "Sticky residential IPs — same egress for 10–30 minutes per session.",
    priceUsd: 8,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 200,
    defaultQty: 5,
    features: ["Sticky TTL control", "Clean fraud scores", "Bulk export"],
    popular: true,
  },
  {
    id: "datacenter-shared",
    name: "Datacenter Shared",
    category: "datacenter",
    protocol: "HTTP / SOCKS5",
    description: "High-speed shared datacenter pool for automation and testing.",
    priceUsd: 3,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 500,
    defaultQty: 10,
    features: ["Low latency", "Unlimited threads", "API access"],
  },
  {
    id: "datacenter-private",
    name: "Datacenter Private",
    category: "datacenter",
    protocol: "HTTP / SOCKS5",
    description: "Dedicated datacenter IP — exclusive to your account.",
    priceUsd: 15,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 100,
    defaultQty: 1,
    features: ["Dedicated IP", "Static session", "24/7 uptime SLA"],
  },
  {
    id: "mobile-lte",
    name: "Mobile 4G / LTE",
    category: "mobile",
    protocol: "SOCKS5 / HTTP",
    description: "Carrier-grade mobile IPs for social, banking, and app testing.",
    priceUsd: 65,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 50,
    defaultQty: 1,
    features: ["Real carrier ASN", "High trust score", "Manual GEO pick"],
  },
  {
    id: "isp-static",
    name: "ISP Static (AdsPower)",
    category: "isp",
    protocol: "SOCKS5",
    description: "Clean ISP static IP — ideal for AdsPower, Dolphin, and multi-login.",
    priceUsd: 49,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 50,
    defaultQty: 1,
    features: ["SOCKS5 auth", "AdsPower template", "Email support"],
    popular: true,
  },
  {
    id: "socks5-private",
    name: "SOCKS5 Private",
    category: "socks5",
    protocol: "SOCKS5",
    description: "Authenticated SOCKS5 endpoint with username/password delivery.",
    priceUsd: 25,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 100,
    defaultQty: 1,
    features: ["User:pass auth", "TCP + UDP", "Custom port"],
  },
  {
    id: "http-https",
    name: "HTTP / HTTPS Proxy",
    category: "http",
    protocol: "HTTP / HTTPS",
    description: "Classic HTTP proxy for browsers, scrapers, and legacy tooling.",
    priceUsd: 20,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 100,
    defaultQty: 1,
    features: ["CONNECT method", "Basic auth", "Whitelist optional"],
  },
  {
    id: "media-fleet",
    name: "Media Buyer Fleet",
    category: "fleet",
    protocol: "SOCKS5 / HTTP",
    description: "5 clean ISP IPs with rotation and session isolation for media buyers.",
    priceUsd: 149,
    unitLabel: "pack / mo",
    minQty: 1,
    maxQty: 10,
    defaultQty: 1,
    features: ["5 IPs included", "Auto-rotation", "Priority provisioning"],
  },
  {
    id: "enterprise-node",
    name: "Enterprise Node",
    category: "fleet",
    protocol: "Multi-protocol",
    description: "Dedicated bare-metal proxy node with custom GEO pools.",
    priceUsd: 399,
    unitLabel: "node / mo",
    minQty: 1,
    maxQty: 5,
    defaultQty: 1,
    features: ["Unlimited threads", "Custom GEO", "Dedicated manager"],
  },
  {
    id: "residential-premium",
    name: "Residential Premium",
    category: "residential",
    protocol: "HTTP / SOCKS5",
    description: "Premium residential pool — lowest block rate for ads & social.",
    priceUsd: 18,
    unitLabel: "GB",
    minQty: 1,
    maxQty: 1000,
    defaultQty: 10,
    features: ["99.9% success rate", "City-level GEO", "API + dashboard"],
    popular: true,
  },
  {
    id: "residential-unlimited",
    name: "Residential Unlimited",
    category: "residential",
    protocol: "HTTP / SOCKS5",
    description: "Unmetered residential bandwidth for high-volume scraping fleets.",
    priceUsd: 499,
    unitLabel: "mo",
    minQty: 1,
    maxQty: 3,
    defaultQty: 1,
    features: ["Fair-use unlimited", "195+ countries", "Dedicated support"],
  },
  {
    id: "mobile-rotating",
    name: "Mobile Rotating",
    category: "mobile",
    protocol: "SOCKS5 / HTTP",
    description: "Rotating 4G/5G mobile IPs — new carrier IP per request or session.",
    priceUsd: 95,
    unitLabel: "GB",
    minQty: 1,
    maxQty: 200,
    defaultQty: 5,
    features: ["5G where available", "App-store safe", "Session control"],
  },
  {
    id: "datacenter-rotating",
    name: "Datacenter Rotating",
    category: "datacenter",
    protocol: "HTTP / SOCKS5",
    description: "Large rotating DC pool — millions of IPs for price-sensitive automation.",
    priceUsd: 2.5,
    unitLabel: "GB",
    minQty: 1,
    maxQty: 2000,
    defaultQty: 20,
    features: ["Sub-second rotation", "Bulk API", "Low cost per GB"],
  },
  {
    id: "ipv6-residential",
    name: "IPv6 Residential",
    category: "ipv6",
    protocol: "HTTP / SOCKS5",
    description: "IPv6 residential endpoints for modern stacks and anti-bot bypass.",
    priceUsd: 6,
    unitLabel: "GB",
    minQty: 1,
    maxQty: 500,
    defaultQty: 10,
    features: ["Dual-stack ready", "Huge address space", "IPv4 fallback optional"],
  },
  {
    id: "ipv6-datacenter",
    name: "IPv6 Datacenter",
    category: "ipv6",
    protocol: "HTTP / SOCKS5",
    description: "High-volume IPv6 datacenter proxies for crawlers and load tests.",
    priceUsd: 1.2,
    unitLabel: "GB",
    minQty: 1,
    maxQty: 5000,
    defaultQty: 50,
    features: ["/64 subnets", "Unlimited concurrency", "REST API"],
  },
  {
    id: "virgin-isp-dedicated",
    name: "Virgin ISP Dedicated",
    category: "isp",
    protocol: "SOCKS5",
    description: "Fresh virgin ISP IP never used on major platforms — max trust.",
    priceUsd: 89,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 30,
    defaultQty: 1,
    features: ["First-use guarantee", "AdsPower / Dolphin", "Replacement SLA"],
  },
  {
    id: "sneaker-residential",
    name: "Sneaker / Retail Residential",
    category: "residential",
    protocol: "HTTP / SOCKS5",
    description: "Optimized sticky residential for checkout bots and retail drops.",
    priceUsd: 14,
    unitLabel: "IP / mo",
    minQty: 1,
    maxQty: 100,
    defaultQty: 5,
    features: ["Long sticky sessions", "Low latency US/EU", "Captcha-friendly"],
  },
  {
    id: "web-unlocker",
    name: "Web Unlocker API",
    category: "fleet",
    protocol: "HTTP API",
    description: "Managed scraping with auto CAPTCHA solve and browser rendering.",
    priceUsd: 25,
    unitLabel: "1k requests",
    minQty: 1,
    maxQty: 500,
    defaultQty: 10,
    features: ["JS rendering", "CAPTCHA bypass", "Pay per success"],
  },
  {
    id: "reverse-proxy-dedicated",
    name: "Reverse Proxy Dedicated",
    category: "datacenter",
    protocol: "HTTP / HTTPS",
    description: "Dedicated reverse proxy node for inbound routing and WAF bypass labs.",
    priceUsd: 79,
    unitLabel: "node / mo",
    minQty: 1,
    maxQty: 20,
    defaultQty: 1,
    features: ["Custom domain", "SSL termination", "Geo routing"],
  },
];

export function findProxyProduct(productId: string): ProxyProduct | null {
  return PROXY_PRODUCTS.find((p) => p.id === productId) ?? null;
}

export function buildProxyPlanName(product: ProxyProduct): string {
  return `${PROXY_PLAN_PREFIX}${product.name}`;
}

export function isProxyPlanName(planName: string): boolean {
  return planName.trim().startsWith(PROXY_PLAN_PREFIX);
}

export function calcProxyOrderAmount(product: ProxyProduct, quantity: number): number {
  const qty = Math.max(product.minQty, Math.min(product.maxQty, Math.floor(quantity)));
  return Math.round(product.priceUsd * qty * 100) / 100;
}

export const PROXY_CATEGORY_LABELS: Record<ProxyCategory, string> = {
  residential: "Residential",
  datacenter: "Datacenter",
  mobile: "Mobile",
  isp: "ISP Static",
  socks5: "SOCKS5",
  http: "HTTP / HTTPS",
  ipv6: "IPv6",
  fleet: "Fleet / Enterprise",
};
