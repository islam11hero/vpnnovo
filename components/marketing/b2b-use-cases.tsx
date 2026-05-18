import { BarChart3, Globe, Shield } from "lucide-react";

const USE_CASES = [
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Ad Verification",
    description:
      "Ensure advertising campaigns render correctly across geographies. Validate creatives, landing pages, and compliance labels from authentic residential and datacenter vantage points—without skewed CDN caching.",
    tags: ["GEO QA", "Creative Validation", "Campaign Integrity"],
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "Brand Protection",
    description:
      "Monitor counterfeit listings, unauthorized resellers, and trademark infringement across global marketplaces. Distributed network intelligence surfaces threats before they erode customer trust.",
    tags: ["Marketplace Monitoring", "Trademark Defense", "Global Sweep"],
  },
  {
    icon: Globe,
    emoji: "🌍",
    title: "Remote Workforce",
    description:
      "Provision Zero-Trust encrypted tunnels for distributed internal teams accessing SaaS, ERP, and proprietary tooling—without exposing corporate networks to the public internet.",
    tags: ["ZTNA", "Identity-Aware Access", "Dedicated Nodes"],
  },
] as const;

export function B2BUseCasesGrid() {
  return (
    <section
      id="use-cases"
      className="bg-slate-950 px-6 py-24"
      aria-labelledby="use-cases-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Network intelligence platform
          </p>
          <h2
            id="use-cases-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            B2B use cases built for enterprise teams.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-slate-400">
            IPNOVA delivers secure, policy-governed network infrastructure for ad
            verification, brand protection, and distributed workforce connectivity.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {USE_CASES.map((item) => (
            <article
              key={item.title}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-md transition hover:border-cyan-500/30"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                  <item.icon className="h-5 w-5 text-cyan-400" aria-hidden />
                </div>
              </div>
              <h3 className="font-poppins text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-400">
                {item.description}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
