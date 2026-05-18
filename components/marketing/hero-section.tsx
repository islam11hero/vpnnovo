"use client";

import { motion } from "framer-motion";
import { ArrowRight, Binary, Lock, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-6 pt-28 pb-24 md:pt-36 md:pb-32"
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.18),transparent)]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300"
        >
          <Binary className="h-4 w-4" aria-hidden />
          Post-Quantum Ready · Anti-DPI Stealth Engine Live
        </motion.div>

        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mb-8 font-poppins text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          Infrastructure for{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Privacy Whales.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl"
        >
          IPNOVA engineers volatile RAM-only tunnels that evade national DPI
          classifiers, settle in untraceable Monero, and provision ghost identities
          without a single inbox on file.
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
            Deploy Node Now
            <ArrowRight className="h-5 w-5" aria-hidden />
          </a>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <Lock className="h-4 w-4 text-emerald-400" aria-hidden />
            Strict No-Logs · RAM-Only Egress
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-slate-800/80 pt-10"
        >
          {["VLESS Vision", "Reality TLS", "XMR Settlement", "Zero-Knowledge Portal"].map(
            (tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase"
              >
                <Shield className="h-3.5 w-3.5 text-cyan-500/80" aria-hidden />
                {tag}
              </span>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}
