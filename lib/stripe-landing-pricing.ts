export type StripeLandingTier = {
  id: string;
  name: string;
  stripeUrl: string;
  /** Shown when set; otherwise UI displays secure checkout label */
  priceLabel?: string;
  billingPeriod?: "year" | "month";
  popular?: boolean;
  features: string[];
};

export type StripeLandingRegionConfig = {
  slug: "gcc" | "china";
  metaTitle: string;
  metaDescription: string;
  badge: string;
  badgeAr?: string;
  headline: string;
  headlineAr?: string;
  subheadline: string;
  subheadlineAr?: string;
  highlights: string[];
  b2cTitle: string;
  b2cSubtitle: string;
  b2bTitle: string;
  b2bSubtitle: string;
  alternateRegion: { label: string; href: string };
  accent: "cyan" | "amber";
  b2c: StripeLandingTier[];
  b2b: StripeLandingTier[];
};

const GCC_B2C: StripeLandingTier[] = [
  {
    id: "basic",
    name: "Basic VPN",
    stripeUrl: "https://buy.stripe.com/8x25kv79F7Fp6ks7tk4ko06",
    billingPeriod: "year",
    features: [
      "VoIP & WhatsApp call stability (UAE/KSA)",
      "Anti-buffering streaming nodes",
      "1 active device",
      "Standard Gulf-optimized routes",
      "Stripe secure checkout",
    ],
  },
  {
    id: "pro",
    name: "Pro VPN",
    stripeUrl: "https://buy.stripe.com/dRmbITbpV5xhgZ614W4ko01",
    billingPeriod: "year",
    popular: true,
    features: [
      "Everything in Basic",
      "Up to 5 devices",
      "Priority low-latency routing",
      "Threat & tracker blocking",
      "AdsPower-ready SOCKS export",
    ],
  },
  {
    id: "ultra",
    name: "Ultra VPN",
    stripeUrl: "https://buy.stripe.com/bJe9AL65B8JtaAI2904ko02",
    billingPeriod: "year",
    features: [
      "Everything in Pro",
      "Up to 10 devices",
      "Dedicated clean ISP egress",
      "OPSEC vault & config exports",
      "Priority support SLA",
    ],
  },
];

const GCC_B2B: StripeLandingTier[] = [
  {
    id: "starter",
    name: "Business Starter",
    stripeUrl: "https://buy.stripe.com/bJe6ozfGb9Nx108bJA4ko03",
    billingPeriod: "month",
    features: [
      "5 team seats · centralized billing",
      "Shared fleet dashboard",
      "Clean GCC egress IPs",
      "Email support · business hours",
    ],
  },
  {
    id: "fleet",
    name: "Business Fleet",
    stripeUrl: "https://buy.stripe.com/5kQeV5gKf0cXeQYfZQ4ko04",
    billingPeriod: "month",
    popular: true,
    features: [
      "25 seats · role-based access",
      "5 dedicated rotating IPs",
      "AdsPower / Dolphin fleet ready",
      "Priority provisioning",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    stripeUrl: "https://buy.stripe.com/14A7sDctZaRBbEM9Bs4ko05",
    billingPeriod: "month",
    features: [
      "Unlimited seats (fair use)",
      "Bare-metal dedicated node option",
      "Custom GEO & compliance review",
      "Dedicated account manager",
    ],
  },
];

const CHINA_B2C: StripeLandingTier[] = [
  {
    id: "basic",
    name: "Basic VPN",
    stripeUrl: "https://buy.stripe.com/28E7sDgKfcZJgZ6aFw4ko00",
    billingPeriod: "year",
    features: [
      "Great Firewall bypass (VLESS Reality)",
      "Stable WeChat & international apps",
      "1 active device",
      "HK / SG low-ping entry nodes",
      "Stripe secure checkout",
    ],
  },
  {
    id: "pro",
    name: "Pro VPN",
    stripeUrl: "https://buy.stripe.com/9B64gr3XtgbV24caFw4ko07",
    billingPeriod: "year",
    popular: true,
    features: [
      "Everything in Basic",
      "Up to 5 devices",
      "Streaming & Zoom stability",
      "SmartExport · Clash / Sing-box",
      "Monthly traffic analytics",
    ],
  },
  {
    id: "ultra",
    name: "Ultra VPN",
    stripeUrl: "https://buy.stripe.com/eVq7sDfGb9Nx5gofZQ4ko08",
    billingPeriod: "year",
    features: [
      "Everything in Pro",
      "Up to 10 devices",
      "Dedicated stealth routing profile",
      "OPSEC rotation & panic revoke",
      "Priority expat support",
    ],
  },
];

const CHINA_B2B: StripeLandingTier[] = [
  {
    id: "starter",
    name: "Business Starter",
    stripeUrl: "https://buy.stripe.com/aFa5kvdy3bVF5go3d44ko09",
    billingPeriod: "month",
    features: [
      "5 seats · cross-border team access",
      "Centralized China-optimized pool",
      "Compliance-friendly logging policy",
      "Business hours support",
    ],
  },
  {
    id: "fleet",
    name: "Business Fleet",
    stripeUrl: "https://buy.stripe.com/6oU6ozgKf1h14ck9Bs4ko0a",
    billingPeriod: "month",
    popular: true,
    features: [
      "25 seats · isolated account lanes",
      "5 clean egress IPs (HK/SG/TW)",
      "Automation stack ready (AdsPower)",
      "Fast-track provisioning",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    stripeUrl: "https://buy.stripe.com/00w14fctZcZJ38gbJA4ko0b",
    billingPeriod: "month",
    features: [
      "Custom seat count & SLA",
      "Dedicated node · unlimited threads",
      "Custom routing & audit reports",
      "Named solutions engineer",
    ],
  },
];

export const STRIPE_LANDING_REGIONS: Record<
  StripeLandingRegionConfig["slug"],
  StripeLandingRegionConfig
> = {
  gcc: {
    slug: "gcc",
    metaTitle: "IPNOVA GCC — VPN for Gulf & MENA | Stripe Checkout",
    metaDescription:
      "Basic, Pro, and Ultra VPN plans optimized for the Gulf. VoIP stability, streaming, and business fleet options. Pay securely with Stripe.",
    badge: "GCC · Gulf Edition",
    badgeAr: "نسخة الخليج",
    headline: "Stealth VPN built for the Gulf.",
    headlineAr: "VPN متقدم مصمم للخليج",
    subheadline:
      "Unblock VoIP, kill buffering, and route through clean GCC-optimized nodes. Personal plans and business fleets — checkout in seconds via Stripe.",
    subheadlineAr:
      "اتصالات VoIP مستقرة، بث بدون تقطيع، وعقد محسّنة للخليج — للأفراد والشركات.",
    highlights: [
      "WhatsApp & VoIP stable in UAE/KSA",
      "Annual personal · monthly business",
      "Stripe · Visa · Mastercard · Amex",
    ],
    b2cTitle: "Personal VPN (B2C)",
    b2cSubtitle: "Annual Gulf plans — pick Basic, Pro, or Ultra.",
    b2bTitle: "Business & Fleet (B2B)",
    b2bSubtitle: "Team seats, dedicated IPs, and enterprise nodes for agencies.",
    alternateRegion: {
      label: "Living in China? See China pricing →",
      href: "/china",
    },
    accent: "cyan",
    b2c: GCC_B2C,
    b2b: GCC_B2B,
  },
  china: {
    slug: "china",
    metaTitle: "IPNOVA China — GFW Bypass VPN | Stripe Checkout",
    metaDescription:
      "VPN plans for residents and expats in China. Great Firewall bypass, WeChat stability, and business fleet options. Secure Stripe checkout.",
    badge: "China · 中国专线",
    headline: "Cross the Firewall. Stay connected.",
    headlineAr: "تجاوز الحظر · اتصال مستقر",
    subheadline:
      "VLESS Reality stealth routing for expats, remote workers, and operators inside China. Personal annual plans and business fleets via Stripe.",
    subheadlineAr:
      "توجيه Stealth للمقيمين في الصين — WeChat، Zoom، وStreaming بثبات.",
    highlights: [
      "GFW-resistant Reality / gRPC cores",
      "HK · Singapore · Taiwan entry",
      "Stripe checkout · instant activation",
    ],
    b2cTitle: "Personal VPN (B2C)",
    b2cSubtitle: "Annual plans for individuals behind the Great Firewall.",
    b2bTitle: "Business & Fleet (B2B)",
    b2bSubtitle: "Teams, media buyers, and cross-border ops at scale.",
    alternateRegion: {
      label: "In the Gulf? See GCC pricing →",
      href: "/gcc",
    },
    accent: "amber",
    b2c: CHINA_B2C,
    b2b: CHINA_B2B,
  },
};

export function getStripeLandingConfig(
  slug: StripeLandingRegionConfig["slug"],
): StripeLandingRegionConfig {
  return STRIPE_LANDING_REGIONS[slug];
}
