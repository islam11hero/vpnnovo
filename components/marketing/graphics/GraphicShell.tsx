"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { scaleIn } from "@/lib/motion-presets";

type Props = {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "amber" | "emerald";
  label?: string;
};

const GLOW = {
  cyan: "from-cyan-500/20 via-blue-600/5 to-transparent",
  amber: "from-amber-500/20 via-orange-600/5 to-transparent",
  emerald: "from-emerald-500/15 via-cyan-500/5 to-transparent",
} as const;

export function GraphicShell({
  children,
  className = "",
  glow = "cyan",
  label,
}: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={scaleIn}
      whileHover={{ y: -4, transition: { duration: 0.35 } }}
      className={`group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/50 backdrop-blur-md ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${GLOW[glow]} opacity-80 transition group-hover:opacity-100`}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(6,182,212,0.25), transparent 50%, rgba(59,130,246,0.15))",
        }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      {label ? (
        <p className="absolute left-4 top-4 z-10 text-[10px] font-bold tracking-[0.2em] text-cyan-400/80 uppercase">
          {label}
        </p>
      ) : null}
      <motion.div
        className="relative flex h-full min-h-[220px] items-center justify-center p-6 md:min-h-[260px]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
