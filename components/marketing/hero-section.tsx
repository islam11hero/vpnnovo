"use client";

import { motion } from "framer-motion";
import { ArrowRight, LineChart } from "lucide-react";

import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export function HeroSection() {
  return (
    <>
      <section
        className="relative overflow-hidden px-6 pt-28 pb-16 md:pt-36 md:pb-20"
        aria-labelledby="hero-heading"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.18),transparent)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300"
          >
            <LineChart className="h-4 w-4" aria-hidden />
            Network Intelligence &amp; Ad Verification Infrastructure
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mb-8 font-poppins text-4xl font-black leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Global Network Infrastructure for Enterprise Data Intelligence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mb-12 max-w-3xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl"
          >
            Empower corporate remote teams with Zero-Trust network access and
            secure market research pipelines. IPNOVA powers ad verification,
            brand protection, and distributed workforce connectivity at scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="#pricing"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-cyan-500/25 transition hover:shadow-cyan-500/40 sm:w-auto"
            >
              View Enterprise Plans
              <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
            <a
              href="/sales"
              className="flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-8 py-4 text-sm font-black text-slate-200 transition hover:border-cyan-500/40 sm:w-auto"
            >
              Talk to Sales
            </a>
          </motion.div>
        </div>
      </section>

      <ComplianceBanner />
    </>
  );
}
