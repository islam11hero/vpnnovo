/** Server-authoritative plan prices (USD) — never trust client `amount`. */
const PLAN_PRICES_USD: Record<string, number> = {
  Standard: 6.99,
  "Pro Shield": 12.99,
  "1 Month": 6.99,
  "6 Months": 29.99,
  "1 Year": 49.99,
};

const ANNUAL_DISCOUNT_PLANS = new Set(["Standard", "Pro Shield"]);

const ANNUAL_PRICES_USD: Record<string, number> = {
  Standard: 4.99,
  "Pro Shield": 7.99,
};

export function resolvePlanAmountUsd(
  planName: string,
  billing: "monthly" | "annual" = "monthly",
): number | null {
  if (billing === "annual" && ANNUAL_DISCOUNT_PLANS.has(planName)) {
    const annual = ANNUAL_PRICES_USD[planName];
    if (annual !== undefined) return annual;
  }
  const price = PLAN_PRICES_USD[planName];
  return price !== undefined ? price : null;
}
