import "server-only";

import {
  getStripeLandingConfig,
  type StripeLandingRegionConfig,
} from "@/lib/stripe-landing-pricing";

export type StripePlanResolution = {
  planName: string;
  amountUsd: number;
  region: "gcc" | "china";
  billingPeriod: "year" | "month";
};

function allTiers(config: StripeLandingRegionConfig) {
  return [...config.b2c, ...config.b2b].map((tier) => ({
    ...tier,
    region: config.slug,
  }));
}

/** Map Stripe metadata or product text to an IPNOVA plan label stored in Supabase. */
export function resolveStripePlanFromSession(input: {
  metadata?: Record<string, string | undefined>;
  productName?: string | null;
  description?: string | null;
  amountTotalCents?: number | null;
}): StripePlanResolution | null {
  const metaPlan = input.metadata?.ipnova_plan?.trim().toLowerCase();
  const metaRegion = input.metadata?.ipnova_region?.trim().toLowerCase();

  for (const slug of ["gcc", "china"] as const) {
    const config = getStripeLandingConfig(slug);
    if (metaRegion && metaRegion !== slug) continue;

    for (const tier of allTiers(config)) {
      const tierKey = `${tier.region}:${tier.id}`;
      if (metaPlan && metaPlan === tier.id) {
        return buildResolution(tier.name, tier.region, tier.billingPeriod ?? "year", input.amountTotalCents);
      }

      const haystack = `${input.productName ?? ""} ${input.description ?? ""}`.toLowerCase();
      if (haystack.includes(tier.name.toLowerCase())) {
        return buildResolution(tier.name, tier.region, tier.billingPeriod ?? "year", input.amountTotalCents);
      }

      if (metaPlan && haystack.includes(metaPlan)) {
        return buildResolution(tier.name, tier.region, tier.billingPeriod ?? "year", input.amountTotalCents);
      }

      void tierKey;
    }
  }

  if (input.amountTotalCents && input.amountTotalCents > 0) {
    return {
      planName: "Stripe VPN Plan",
      amountUsd: input.amountTotalCents / 100,
      region: metaRegion === "china" ? "china" : "gcc",
      billingPeriod: "year",
    };
  }

  return null;
}

function buildResolution(
  name: string,
  region: "gcc" | "china",
  billingPeriod: "year" | "month",
  amountTotalCents?: number | null,
): StripePlanResolution {
  const regionLabel = region === "gcc" ? "GCC" : "China";
  return {
    planName: `${name} (${regionLabel})`,
    amountUsd:
      amountTotalCents && amountTotalCents > 0
        ? amountTotalCents / 100
        : 0,
    region,
    billingPeriod,
  };
}
