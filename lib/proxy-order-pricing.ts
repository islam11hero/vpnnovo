import type { ProxyProduct } from "@/lib/proxy-catalog";
import type { ProxyAddon, ProxyPricingTier } from "@/lib/proxy-product-config";

export type ProxyOrderQuoteInput = {
  product: ProxyProduct;
  tier: ProxyPricingTier;
  quantity: number;
  durationDays: number;
  addons: ProxyAddon[];
};

function clampQty(tier: ProxyPricingTier, quantity: number): number {
  const q = Math.floor(quantity);
  if (!Number.isFinite(q)) return tier.defaultQty;
  return Math.max(tier.minQty, Math.min(tier.maxQty, q));
}

function durationMultiplier(product: ProxyProduct, durationDays: number): number {
  const days = Math.max(1, Math.min(365, Math.floor(durationDays)));
  const label = product.unitLabel.toLowerCase();
  if (label.includes("gb") || label.includes("request") || label.includes("1k")) {
    return 1;
  }
  if (label.includes("mo") || label.includes("ip") || label.includes("node") || label.includes("pack")) {
    return days / 30;
  }
  return 1;
}

export function calcProxyOrderQuote(input: ProxyOrderQuoteInput): {
  quantity: number;
  subtotalUsd: number;
  addonsUsd: number;
  totalUsd: number;
} {
  const quantity = clampQty(input.tier, input.quantity);
  const mult = durationMultiplier(input.product, input.durationDays);

  const subtotalUsd =
    Math.round(input.tier.unitPriceUsd * quantity * mult * 100) / 100;

  let addonsUsd = 0;
  for (const addon of input.addons) {
    let line = addon.priceUsd;
    if (addon.priceType === "per_unit") {
      line *= quantity;
    } else if (addon.priceType === "per_month") {
      line *= mult;
    }
    addonsUsd += line;
  }
  addonsUsd = Math.round(addonsUsd * 100) / 100;

  const totalUsd = Math.round((subtotalUsd + addonsUsd) * 100) / 100;

  return { quantity, subtotalUsd, addonsUsd, totalUsd };
}

export function formatProxyOrderNote(input: {
  tierName: string;
  quantity: number;
  unitLabel: string;
  durationDays: number;
  addonNames: string[];
  geoRequest: string;
  userNote: string;
}): string {
  const lines = [
    `Tier: ${input.tierName}`,
    `Qty: ${input.quantity} ${input.unitLabel}`,
    `Duration: ${input.durationDays} days`,
  ];
  if (input.addonNames.length > 0) {
    lines.push(`Add-ons: ${input.addonNames.join(", ")}`);
  }
  if (input.geoRequest.trim()) {
    lines.push(`GEO: ${input.geoRequest.trim()}`);
  }
  if (input.userNote.trim()) {
    lines.push(`Note: ${input.userNote.trim()}`);
  }
  return lines.join(" | ").slice(0, 500);
}
