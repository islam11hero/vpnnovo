import { CheckCircle2 } from "lucide-react";

import { CryptoCheckoutButton } from "@/components/marketing/CryptoCheckoutButton";
import { PROXY_TIERS } from "@/lib/marketing-pricing";

export function ProxyPricing() {
  return (
    <section
      id="proxy-pricing"
      className="bg-slate-950 px-6 py-12"
      aria-labelledby="proxy-pricing-heading"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-amber-400 uppercase">
            Dedicated infrastructure
          </p>
          <h2
            id="proxy-pricing-heading"
            className="font-poppins text-3xl font-black text-white md:text-4xl"
          >
            Proxy &amp; fleet pricing
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Crypto-first checkout for operators who need clean IPs at scale.
            USDT, BTC, or ETH via NOWPayments.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {PROXY_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.popular
                  ? "border-amber-500/50 bg-gradient-to-b from-amber-950/30 to-slate-950 shadow-xl shadow-amber-900/20"
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {tier.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 uppercase">
                  Best for fleets
                </span>
              ) : null}
              <h3 className="font-poppins text-xl font-bold text-white">
                {tier.name}
              </h3>
              <p className="mt-3 font-poppins text-4xl font-black text-amber-200">
                ${tier.price}
                <span className="text-base font-medium text-slate-500">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                      aria-hidden
                    />
                    {feat}
                  </li>
                ))}
              </ul>
              <CryptoCheckoutButton
                tierType="proxy"
                tierId={tier.id}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-4 text-sm font-black text-white shadow-lg transition hover:shadow-amber-500/30"
                label={`Pay with Crypto — ${tier.name}`}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
