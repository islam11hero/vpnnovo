import {
  B2C_TIERS,
  PROXY_TIERS,
  resolveMarketingPlanName,
  resolveMarketingPlanPrice,
} from "@/lib/marketing-pricing";
import { isAllowedPlan } from "@/lib/marzban";
import {
  resolvePlanAmountUsd,
  type BillingCycle,
} from "@/lib/plan-pricing";

export const MARKETING_PLAN_NAMES = [
  ...B2C_TIERS.map((tier) => `IPNOVA ${tier.name} (Annual)`),
  ...PROXY_TIERS.map((tier) => tier.name),
] as const;

export function isCheckoutPlanAllowed(planName: string): boolean {
  return isAllowedPlan(planName) || MARKETING_PLAN_NAMES.includes(planName as (typeof MARKETING_PLAN_NAMES)[number]);
}

export function resolveCryptoCheckoutPlan(input: {
  planName?: string;
  tierType?: "b2c" | "proxy";
  tierId?: string;
  billing?: BillingCycle;
}): { planName: string; amountUsd: number } | null {
  if (input.tierType && input.tierId) {
    const planName = resolveMarketingPlanName(input.tierType, input.tierId);
    const amountUsd = resolveMarketingPlanPrice(input.tierType, input.tierId);
    if (planName && amountUsd !== null) {
      return { planName, amountUsd };
    }
    return null;
  }

  const planName = input.planName?.trim() ?? "";
  if (!planName) return null;

  const amountUsd = resolvePlanAmountUsd(planName, input.billing ?? "monthly");
  if (amountUsd === null || amountUsd <= 0) return null;

  return { planName, amountUsd };
}
