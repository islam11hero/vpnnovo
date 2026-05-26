import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, Server } from "lucide-react";

import { PROXY_TIERS } from "@/lib/marketing-pricing";

const STARTING_PRICE = Math.min(...PROXY_TIERS.map((t) => t.price));

const PROXY_TYPES = [
  "Residential",
  "Mobile 4G/5G",
  "ISP static",
  "Datacenter",
] as const;

export function ProxyHomeTeaser() {
  return (
    <section
      id="proxies"
      className="border-y border-slate-800/80 bg-gradient-to-b from-violet-950/20 to-slate-950 px-6 py-20"
      aria-labelledby="proxy-teaser-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.25em] text-violet-400 uppercase">
              Proxy marketplace
            </p>
            <h2
              id="proxy-teaser-heading"
              className="font-poppins text-3xl font-black text-white md:text-4xl"
            >
              Buy clean IPs — not bundled mystery packs
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-slate-400">
              Configure product, GEO, duration, and add-ons. Pay with crypto. Credentials
              delivered to your portal vault — same Order ID workflow as VPN.
            </p>
            <p className="mt-4 text-sm font-bold text-violet-300">
              From ${STARTING_PRICE}/mo · AdsPower &amp; Dolphin ready
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {PROXY_TYPES.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200"
                >
                  {type}
                </span>
              ))}
            </div>
            <Link
              href="/pricing?tab=b2b"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-900/30 transition hover:shadow-violet-800/40"
            >
              Configure proxy order
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-violet-500/25">
              <Image
                src="/marketing/marketing-proxy-marketplace.png"
                alt="Proxy marketplace for residential and mobile IPs"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-bold text-violet-200">
                Configure → Pay crypto → Collect SOCKS5 in your vault
              </p>
            </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
              <Server className="h-4 w-4 text-violet-400" aria-hidden />
              Popular for teams
            </div>
            <ul className="space-y-3">
              {PROXY_TIERS.map((tier) => (
                <li
                  key={tier.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
                >
                  <span>
                    <span className="block text-sm font-bold text-white">
                      {tier.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {tier.features[0]}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-sm font-bold text-violet-300">
                    ${tier.price}/mo
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              Full catalog with tiers &amp; add-ons on the pricing page
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
