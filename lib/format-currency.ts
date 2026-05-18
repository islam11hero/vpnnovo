const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return usdFormatter.format(0);
  return usdFormatter.format(amount);
}

export function netProfitValueClass(amount: number): string {
  if (amount > 0) return "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]";
  if (amount < 0) return "text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.35)]";
  return "text-slate-300";
}
