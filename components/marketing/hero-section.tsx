"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

import { HeroVaultPreview } from "@/components/marketing/HeroVaultPreview";
import { AmbientOrbs } from "@/components/marketing/motion/AmbientOrbs";
import { EASE_SMOOTH } from "@/lib/motion-presets";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-6 pt-28 pb-12 md:pt-36 md:pb-16"
      aria-labelledby="hero-heading"
    >
      <AmbientOrbs variant="cyan" />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.18),transparent)]"
        aria-hidden
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE_SMOOTH }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300"
          >
            <Zap className="h-4 w-4" aria-hidden />
            VPN + Proxy · Pay with crypto · Instant portal
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mb-6 font-poppins text-4xl font-black leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            Fast VPN &amp; clean proxies —{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              no buffering, no blocks
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mb-10 max-w-xl text-lg font-medium leading-relaxed text-slate-400 lg:mx-0 md:text-xl"
          >
            Stable VoIP and streaming in GCC, stealth VLESS for privacy, and a proxy
            marketplace for AdsPower teams. Activate in minutes — Order ID access, no
            email required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <motion.a
              href="#free-trial"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-cyan-500/25 transition hover:shadow-cyan-500/40 sm:w-auto"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              Start free trial
            </motion.a>
            <motion.a
              href="#pricing"
              whileHover={{ scale: 1.02, borderColor: "rgba(6,182,212,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-8 py-4 text-sm font-black text-slate-200 transition sm:w-auto"
            >
              Buy with crypto
              <ArrowRight className="h-4 w-4" aria-hidden />
            </motion.a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-xs font-medium text-slate-500"
          >
            24h trial · 1 GB · VLESS Reality ·{" "}
            <a href="#faq" className="text-cyan-500/90 hover:underline">
              FAQ
            </a>
          </motion.p>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_SMOOTH }}
            className="mx-auto w-full max-w-md space-y-4 lg:max-w-none"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-cyan-500/25 shadow-xl shadow-cyan-900/20">
              <Image
                src="/marketing/marketing-hero-vault.png"
                alt="IPNOVA vault: crypto checkout, portal access, and VPN QR setup"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-center text-[11px] font-bold tracking-wide text-cyan-200/90 uppercase">
                Pay · Portal · Connect
              </p>
            </div>
            <HeroVaultPreview />
          </motion.div>
      </motion.div>
    </section>
  );
}
