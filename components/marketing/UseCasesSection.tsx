"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Globe,
  MessageCircle,
  Server,
} from "lucide-react";

import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { fadeUp, staggerContainer } from "@/lib/motion-presets";

const CASES = [
  {
    icon: MessageCircle,
    title: "Living in UAE & GCC",
    description:
      "Stable WhatsApp and VoIP calls, banking apps, and streaming without constant reconnects.",
    cta: "GCC plans",
    href: "/gcc",
    accent: "border-cyan-500/30 hover:border-cyan-500/50",
    iconClass: "text-cyan-400",
  },
  {
    icon: Briefcase,
    title: "Media buyers & AdsPower",
    description:
      "Residential and ISP proxies with SOCKS5 auth — isolate accounts per GEO without shared dirty IPs.",
    cta: "Browse proxies",
    href: "/pricing?tab=b2b",
    accent: "border-violet-500/30 hover:border-violet-500/50",
    iconClass: "text-violet-400",
  },
  {
    icon: Server,
    title: "Developers & automation",
    description:
      "VLESS subscription for v2rayNG, Hiddify, or route scrapers through clean egress with usage telemetry.",
    cta: "Start free trial",
    href: "#free-trial",
    accent: "border-emerald-500/30 hover:border-emerald-500/50",
    iconClass: "text-emerald-400",
  },
] as const;

export function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="relative overflow-hidden bg-slate-950 px-6 py-20"
      aria-labelledby="use-cases-heading"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Built for real pain
          </p>
          <h2
            id="use-cases-heading"
            className="font-poppins text-3xl font-black text-white md:text-4xl"
          >
            Who IPNOVA is for
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-slate-400">
            Pick the path that matches your stack — VPN vault, proxy marketplace, or
            both on one account.
          </p>
        </RevealOnScroll>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {CASES.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={fadeUp}
                className={`flex flex-col rounded-2xl border bg-slate-950/60 p-6 transition ${item.accent}`}
              >
                <span
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 ${item.iconClass}`}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-poppins text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-slate-400">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        <RevealOnScroll className="mt-10 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Globe className="h-4 w-4 text-slate-600" aria-hidden />
            Enterprise fleet?{" "}
            <Link href="/sales" className="font-bold text-cyan-400 hover:underline">
              Talk to sales
            </Link>
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
