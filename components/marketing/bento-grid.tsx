"use client";

import { motion } from "framer-motion";
import {
  Bitcoin,
  Cpu,
  EyeOff,
  HardDrive,
  Radar,
  Shield,
  Zap,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45 },
};

export function BentoGrid() {
  return (
    <section
      id="bento"
      className="border-y border-slate-800/80 bg-slate-950 px-6 py-24"
      aria-labelledby="bento-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 max-w-3xl">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Threat-model architecture
          </p>
          <h2
            id="bento-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            Engineered beyond consumer VPN theater.
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-400">
            Every module is purpose-built for operators who treat surveillance as
            the adversary—not marketing copy.
          </p>
        </header>

        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
          {/* Large — Anti-DPI */}
          <motion.article
            {...fadeUp}
            className="group relative col-span-1 overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-950 p-8 md:col-span-4 md:row-span-2 md:p-10"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-500/20" />
            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
                <EyeOff className="h-7 w-7 text-cyan-400" />
              </div>
              <h3 className="mb-4 font-poppins text-2xl font-black text-white md:text-3xl">
                Anti-DPI Stealth Engine
              </h3>
              <p className="max-w-xl text-base font-medium leading-relaxed text-slate-400">
                Stateful firewalls fingerprint VPN handshakes in milliseconds.
                IPNOVA rotates TLS entropy profiles and masquerades tunnel traffic as
                benign HTTPS—defeating Deep Packet Inspection without the throughput
                collapse legacy protocols suffer behind national filters.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {["DPI Evasion", "TLS Camouflage", "Wire-Speed Egress"].map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-300"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>

          {/* Medium — RAM */}
          <motion.article
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="group col-span-1 rounded-3xl border border-slate-700/60 bg-slate-900/50 p-7 backdrop-blur-sm transition hover:border-emerald-500/30 md:col-span-2"
          >
            <HardDrive className="mb-4 h-8 w-8 text-emerald-400" />
            <h3 className="mb-2 font-poppins text-xl font-bold text-white">
              Global RAM-Only Network
            </h3>
            <p className="text-sm font-medium leading-relaxed text-slate-400">
              Disk forensics recover nothing. Session tables live exclusively in
              volatile memory and vaporize on reboot—architecture, not policy.
            </p>
          </motion.article>

          {/* Medium — Crypto */}
          <motion.article
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="group col-span-1 rounded-3xl border border-slate-700/60 bg-slate-900/50 p-7 backdrop-blur-sm transition hover:border-amber-500/30 md:col-span-2"
          >
            <Bitcoin className="mb-4 h-8 w-8 text-amber-400" />
            <h3 className="mb-2 font-poppins text-xl font-bold text-white">
              Untraceable Crypto Payments
            </h3>
            <p className="text-sm font-medium leading-relaxed text-slate-400">
              Sovereign tiers settle in Monero (XMR). No card rails, no chargeback
              surveillance—only ring-signature settlement and ghost-account UUIDs.
            </p>
          </motion.article>

          {/* Wide — Radar */}
          <motion.article
            {...fadeUp}
            transition={{ delay: 0.12 }}
            className="relative col-span-1 overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-slate-950 via-red-950/20 to-slate-950 p-8 md:col-span-6"
          >
            <div className="radar-pulse pointer-events-none absolute inset-0 flex items-center justify-center opacity-40" aria-hidden>
              <div className="radar-ring h-48 w-48 rounded-full border border-red-500/30" />
              <div className="radar-ring radar-ring-delay-1 absolute h-72 w-72 rounded-full border border-red-500/20" />
              <div className="radar-ring radar-ring-delay-2 absolute h-96 w-96 rounded-full border border-red-500/10" />
              <Radar className="relative z-10 h-12 w-12 text-red-500/80" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  <span className="text-xs font-bold tracking-widest text-red-400 uppercase">
                    Live threat surface
                  </span>
                </div>
                <h3 className="font-poppins text-2xl font-black text-white md:text-3xl">
                  Dark Web Threat Radar
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400 md:text-base">
                  Correlates leaked credential dumps and C2 beacon chatter against
                  your egress fingerprint—alerting before your identity surfaces on
                  underground marketplaces.
                </p>
              </div>
                <div className="flex shrink-0 gap-3">
                  <div className="rounded-xl border border-red-900/50 bg-black/40 px-4 py-3 text-center">
                    <p className="text-2xl font-black text-red-400">0</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Logs stored</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-black/40 px-4 py-3 text-center">
                    <Cpu className="mx-auto mb-1 h-5 w-5 text-cyan-400" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase">PQ Hybrid</p>
                  </div>
                </div>
            </div>
          </motion.article>

          {/* Small row */}
          <motion.article
            {...fadeUp}
            className="col-span-1 rounded-3xl border border-slate-700/60 bg-slate-900/40 p-6 md:col-span-2"
          >
            <Zap className="mb-3 h-6 w-6 text-violet-400" />
            <h3 className="font-poppins text-lg font-bold text-white">PQ Handshake</h3>
            <p className="mt-2 text-sm text-slate-400">
              Hybrid classical + post-quantum exchange where clients support it.
            </p>
          </motion.article>
          <motion.article
            {...fadeUp}
            className="col-span-1 rounded-3xl border border-slate-700/60 bg-slate-900/40 p-6 md:col-span-2"
          >
            <Shield className="mb-3 h-6 w-6 text-cyan-400" />
            <h3 className="font-poppins text-lg font-bold text-white">Multi-Hop Cascade</h3>
            <p className="mt-2 text-sm text-slate-400">
              Sovereign routes chain volatile hops for separation of knowledge.
            </p>
          </motion.article>
          <motion.article
            {...fadeUp}
            className="col-span-1 rounded-3xl border border-slate-700/60 bg-slate-900/40 p-6 md:col-span-2"
          >
            <EyeOff className="mb-3 h-6 w-6 text-emerald-400" />
            <h3 className="font-poppins text-lg font-bold text-white">Ghost Portal</h3>
            <p className="mt-2 text-sm text-slate-400">
              UUID-only client dashboard. No email recovery vectors.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
