"use client";

import { motion } from "framer-motion";

import { GraphicShell } from "@/components/marketing/graphics/GraphicShell";

type Props = {
  className?: string;
  showShell?: boolean;
};

const WAVE =
  "M20 120 Q50 80 80 120 T140 120 T200 120 T260 120";

export function LatencyWaveGraphic({ className = "", showShell = true }: Props) {
  const svg = (
    <svg
      viewBox="0 0 280 220"
      className="h-full w-full max-h-[280px] max-w-[320px]"
      aria-hidden
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {[0, 1, 2].map((i) => (
        <motion.line
          key={i}
          x1="20"
          y1={80 + i * 35}
          x2="260"
          y2={80 + i * 35}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2 8"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <motion.path
        d={WAVE}
        fill="none"
        stroke="url(#waveGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.path
        d={WAVE}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
        animate={{
          d: [
            "M20 120 Q50 80 80 120 T140 120 T200 120 T260 120",
            "M20 120 Q50 100 80 120 T140 100 T200 120 T260 120",
            "M20 120 Q50 80 80 120 T140 120 T200 120 T260 120",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {[60, 120, 180].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy={120}
          r="5"
          fill="#22d3ee"
          animate={{
            cy: [120, i === 1 ? 95 : 110, 120],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.g
        animate={{ x: [0, 180, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="40" cy="120" r="8" fill="#06b6d4" opacity="0.3" />
        <circle cx="40" cy="120" r="4" fill="#67e8f9" />
      </motion.g>

      <motion.text
        x="195"
        y="55"
        fill="#34d399"
        fontSize="22"
        fontWeight="800"
        fontFamily="var(--font-poppins), system-ui"
        animate={{ opacity: [0.7, 1, 0.7], y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        12ms
      </motion.text>
      <text x="195" y="72" fill="#64748b" fontSize="9" fontWeight="600">
        AVG LATENCY
      </text>

      <motion.rect
        x="30"
        y="165"
        width="220"
        height="8"
        rx="4"
        fill="#1e293b"
      />
      <motion.rect
        x="30"
        y="165"
        height="8"
        rx="4"
        fill="url(#waveGrad)"
        animate={{ width: [80, 210, 80] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );

  if (!showShell) return svg;

  return (
    <GraphicShell className={className} glow="cyan" label="Low latency">
      {svg}
    </GraphicShell>
  );
}
