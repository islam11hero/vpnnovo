import {
  Bitcoin,
  Globe2,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

const ITEMS = [
  { icon: Bitcoin, label: "Crypto checkout", detail: "BTC · USDT · NOWPayments" },
  { icon: Zap, label: "Instant activation", detail: "Portal link after payment" },
  { icon: Shield, label: "VLESS Reality", detail: "Stealth · no logs policy" },
  { icon: Globe2, label: "195+ GEO routes", detail: "GCC · EU · US egress" },
  { icon: Wallet, label: "30-day guarantee", detail: "Under 1 GB usage" },
  { icon: Sparkles, label: "Free trial", detail: "24h · 1 GB · no card" },
] as const;

export function TrustBar() {
  return (
    <section
      className="border-y border-slate-800/80 bg-slate-900/40 px-6 py-8"
      aria-label="Trust highlights"
    >
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10">
                <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500">
                  {item.detail}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
