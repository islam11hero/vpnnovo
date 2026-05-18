import { BadgeCheck, Building2, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    role: "CISO, FinTech Scale-up",
    badge: "SOC 2 Type II",
    quote:
      "IPNOVA replaced our legacy remote-access concentrator. ZTNA policies map cleanly to Okta groups, and our auditors appreciated the published legal stack and Stripe-backed billing.",
    metric: "40% faster onboarding",
  },
  {
    role: "IT Director, Distributed Agency",
    badge: "Dedicated EU Nodes",
    quote:
      "Our creative teams access client DAMs over dedicated private nodes in Madrid. Latency stayed flat while we gained instant session revocation from a single admin console.",
    metric: "<45ms EU latency",
  },
  {
    role: "Head of Infrastructure, HealthTech",
    badge: "HIPAA-Aligned Controls",
    quote:
      "Vendor security review was straightforward: AES-256 transport, no-log architecture, and a responsive abuse desk. That is table stakes for healthcare SaaS partners.",
    metric: "Passed VRM in 2 weeks",
  },
] as const;

export function EnterpriseSocialProof() {
  return (
    <section
      id="experts"
      className="bg-slate-950 px-6 py-24"
      aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Trusted by security leaders
          </p>
          <h2
            id="social-proof-heading"
            className="font-poppins text-3xl font-black text-white md:text-4xl"
          >
            Enterprise teams ship faster on IPNOVA.
          </h2>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((expert) => (
            <blockquote
              key={expert.role}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md"
            >
              <Quote className="mb-4 h-8 w-8 text-cyan-500/40" aria-hidden />
              <p className="flex-1 text-sm font-medium leading-relaxed text-slate-300">
                {expert.quote}
              </p>
              <footer className="mt-6 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold text-white">
                      <Building2 className="h-4 w-4 text-slate-500" aria-hidden />
                      {expert.role}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                      {expert.badge}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-bold text-slate-400">
                    {expert.metric}
                  </span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
