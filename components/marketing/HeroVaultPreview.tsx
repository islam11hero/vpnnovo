"use client";

import { motion } from "framer-motion";
import { Activity, Globe2, Lock, ShieldCheck, Wifi } from "lucide-react";

const STATS = [
  { label: "Latency", value: "12 ms", icon: Activity },
  { label: "Protocol", value: "VLESS REALITY", icon: Lock },
  { label: "Nodes", value: "40+ GEOs", icon: Globe2 },
] as const;

export function HeroVaultPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="relative mx-auto w-full max-w-md"
    >
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-cyan-500/10 blur-2xl"
        aria-hidden
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/80 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-bold tracking-wide text-emerald-400 uppercase">
                Shield active
              </span>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
              OPSEC Vault
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="font-poppins text-sm font-bold text-white">
                Stealth tunnel online
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Censorship-resistant routing · VoIP-ready · AdsPower SOCKS export
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-2 py-3 text-center"
              >
                <Icon className="mx-auto mb-1.5 h-4 w-4 text-cyan-400" />
                <p className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                  {label}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-bold text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-[10px] font-bold text-slate-400">
              <span>Session health</span>
              <span className="text-cyan-400">98%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                initial={{ width: "0%" }}
                animate={{ width: "98%" }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
            <Wifi className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-xs text-slate-400">
              Instant portal · QR import · crypto checkout
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
