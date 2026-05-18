import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Headphones,
  Network,
  ShieldCheck,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SalesContactForm } from "@/components/marketing/sales-contact-form";

export const metadata: Metadata = {
  title: "Enterprise Network Solutions | IPNOVA Sales",
  description:
    "Book a consultation for IPNOVA Enterprise Infrastructure—dedicated nodes, custom IP allocation, and 99.99% SLA.",
};

const SIDEBAR_BENEFITS = [
  {
    icon: Headphones,
    title: "Dedicated Account Manager",
    description:
      "A named enterprise executive for onboarding, capacity planning, and renewal strategy.",
  },
  {
    icon: Network,
    title: "Custom IP Allocation",
    description:
      "Static and rotating IP pools tailored to ad verification, brand protection, or internal access policies.",
  },
  {
    icon: ShieldCheck,
    title: "99.99% SLA Guarantee",
    description:
      "Contractual uptime commitments with service credits and 24/7 escalation for Tier-3 customers.",
  },
] as const;

export default function SalesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <MarketingHeader />

      <main className="flex-1 px-6 py-12 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>

          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="mb-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
                Enterprise Infrastructure — $499/mo+
              </p>
              <h1 className="font-poppins text-3xl font-black text-white md:text-5xl">
                Enterprise Network Solutions — Book a Consultation
              </h1>
              <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-400">
                Tell us about your bandwidth, regions, and use case. Our team will
                design a dedicated network intelligence deployment for ad verification,
                brand protection, or secure remote access.
              </p>
              <div className="mt-10">
                <SalesContactForm />
              </div>
            </div>

            <aside className="lg:col-span-2">
              <div className="sticky top-28 space-y-4">
                <h2 className="text-sm font-bold tracking-wide text-white">
                  Included with Enterprise Infrastructure
                </h2>
                {SIDEBAR_BENEFITS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md"
                  >
                    <item.icon className="mb-3 h-6 w-6 text-cyan-400" aria-hidden />
                    <h3 className="font-poppins text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ))}
                <p className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs font-medium text-slate-500">
                  B2B infrastructure setup fees are non-refundable per our{" "}
                  <Link href="/refund" className="text-cyan-500 hover:underline">
                    Refund Policy
                  </Link>
                  . All services subject to our{" "}
                  <Link href="/aup" className="text-cyan-500 hover:underline">
                    Acceptable Use Policy
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
