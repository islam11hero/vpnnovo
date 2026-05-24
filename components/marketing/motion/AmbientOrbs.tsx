"use client";

import { motion } from "framer-motion";

type Props = {
  variant?: "cyan" | "amber" | "mixed";
};

export function AmbientOrbs({ variant = "cyan" }: Props) {
  const primary =
    variant === "amber"
      ? "bg-amber-500/20"
      : variant === "mixed"
        ? "bg-cyan-500/15"
        : "bg-cyan-500/20";
  const secondary =
    variant === "amber" ? "bg-orange-500/10" : "bg-blue-600/15";

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-[100px] ${primary}`}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 30, -15, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute top-1/3 -right-20 h-80 w-80 rounded-full blur-[90px] ${secondary}`}
        animate={{
          x: [0, -35, 25, 0],
          y: [0, -25, 20, 0],
          scale: [1, 0.92, 1.06, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-500/8 blur-[80px]"
        animate={{
          x: [0, 30, -30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
