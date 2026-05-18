/** Whale / OPSEC tier — fixed annual price (privacy professionals). */
export const SOVEREIGN_PLAN_NAME = "Normaroc Sovereign (OPSEC)";
export const SOVEREIGN_ANNUAL_PRICE_USD = 299.99;

export type BillingCycle = "monthly" | "annual" | "sovereign";

/** Server-authoritative plan prices (USD) — never trust client `amount`. */
const PLAN_PRICES_USD: Record<string, number> = {
  Standard: 6.99,
  "Pro Shield": 12.99,
  "1 Month": 6.99,
  "6 Months": 29.99,
  "1 Year": 49.99,
  [SOVEREIGN_PLAN_NAME]: SOVEREIGN_ANNUAL_PRICE_USD,
};

const ANNUAL_DISCOUNT_PLANS = new Set(["Standard", "Pro Shield"]);

const ANNUAL_PRICES_USD: Record<string, number> = {
  Standard: 4.99,
  "Pro Shield": 7.99,
};

export function resolvePlanAmountUsd(
  planName: string,
  billing: BillingCycle = "monthly",
): number | null {
  if (planName === SOVEREIGN_PLAN_NAME || billing === "sovereign") {
    return SOVEREIGN_ANNUAL_PRICE_USD;
  }
  if (billing === "annual" && ANNUAL_DISCOUNT_PLANS.has(planName)) {
    const annual = ANNUAL_PRICES_USD[planName];
    if (annual !== undefined) return annual;
  }
  const price = PLAN_PRICES_USD[planName];
  return price !== undefined ? price : null;
}
