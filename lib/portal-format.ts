import { formatUnixDate } from "@/lib/formatters";

export function formatPortalCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPortalExpiry(expire: number | null): string | null {
  if (!expire || expire <= 0) return null;
  const label = formatUnixDate(expire);
  return label === "Unlimited" ? null : label;
}

export { usagePercent } from "@/lib/formatters";
