import Link from "next/link";
import { Building2, CheckCircle2, Crown, Users } from "lucide-react";

const TIERS = [
  {
    name: "Freelancer Node",
    price: 49,
    description:
      "Solo analysts and boutique agencies running GEO ad verification and brand monitoring workloads.",
    features: [
      "1 dedicated egress node",
      "Ad verification & GEO QA tooling",
      "AES-256 encrypted transport",
      "Email support (24h SLA)",
    ],
    cta: "Start Free Trial",
    href: "/portal",
    popular: false,
    icon: Users,
  },
  {
    name: "Agency Fleet",
    price: 149,
    description:
      "Multi-seat teams orchestrating parallel market research and brand protection sweeps across regions.",
    features: [
      "5 regional private nodes",
      "Team seat management",
      "Bandwidth analytics dashboard",
      "Priority support (8h SLA)",
    ],
    cta: "Deploy Fleet",
    href: "mailto:support@ipnova.com?subject=Agency%20Fleet%20Deployment",
    popular: true,
    icon: Building2,
  },
  {
    name: "Enterprise Infrastructure",
    price: 499,
    description:
      "Custom IP allocation, dedicated account management, and contractual SLAs for global enterprises.",
    features: [
      "Unlimited regional nodes",
      "Dedicated account manager",
      "Custom IP pools & rotation",
      "99.99% uptime SLA",
    ],
    cta: "Talk to Sales",
    href: "/sales",
    popular: false,
    icon: Crown,
  },
] as const;

export function EnterprisePricingSection() {
  return (
    <section
      id="pricing"
      className="border-t border-slate-800 bg-slate-950 px-6 py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            B2B pricing
          </p>
          <h2
            id="pricing-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            Infrastructure that scales with your intelligence pipeline.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-slate-400">
            Subscriptions billed securely via Stripe. Enterprise contracts and
            custom bandwidth available on consultation.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <article
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-md ${
                  tier.popular
                    ? "border-cyan-500/50 bg-slate-900/80 shadow-xl shadow-cyan-500/10 lg:scale-[1.02]"
                    : "border-slate-800 bg-slate-900/50"
                }`}
              >
                {tier.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-black tracking-wider text-slate-950 uppercase">
                    Most Popular
                  </span>
                ) : null}
                <Icon className="mb-3 h-6 w-6 text-cyan-400" aria-hidden />
                <h3 className="font-poppins text-2xl font-bold text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 min-h-[3.5rem] text-sm font-medium text-slate-400">
                  {tier.description}
                </p>
                <p className="mt-6 font-poppins text-5xl font-black text-white">
                  ${tier.price}
                  <span className="text-lg font-medium text-slate-500">/mo</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2 text-sm font-medium text-slate-300"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                        aria-hidden
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 block rounded-xl py-4 text-center text-sm font-black transition ${
                    tier.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                      : tier.name === "Enterprise Infrastructure"
                        ? "border border-amber-500/40 bg-amber-950/30 text-amber-100 hover:bg-amber-950/50"
                        : "border border-slate-700 bg-slate-800/80 text-white hover:border-cyan-500/40"
                  }`}
                >
                  {tier.cta}
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs font-medium text-slate-600">
          Prices in USD. Subject to{" "}
          <Link href="/terms" className="text-cyan-500 hover:underline">
            Terms
          </Link>
          ,{" "}
          <Link href="/refund" className="text-cyan-500 hover:underline">
            Refund Policy
          </Link>
          , and{" "}
          <Link href="/aup" className="text-cyan-500 hover:underline">
            Acceptable Use Policy
          </Link>
          . Setup fees may apply to Enterprise Infrastructure.
        </p>
      </div>
    </section>
  );
}
