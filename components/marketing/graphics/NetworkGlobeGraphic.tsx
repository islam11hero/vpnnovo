"use client";

import { motion } from "framer-motion";

import { GraphicShell } from "@/components/marketing/graphics/GraphicShell";
import { pulseOpacity, slowRotate } from "@/lib/motion-presets";

const NODES = [
  { cx: 120, cy: 55, delay: 0 },
  { cx: 185, cy: 95, delay: 0.4 },
  { cx: 165, cy: 165, delay: 0.8 },
  { cx: 75, cy: 150, delay: 1.2 },
  { cx: 45, cy: 90, delay: 1.6 },
] as const;

type Props = {
  compact?: boolean;
  className?: string;
  showShell?: boolean;
};

export function NetworkGlobeGraphic({
  compact = false,
  className = "",
  showShell = true,
}: Props) {
  const svg = (
    <svg
      viewBox="0 0 240 220"
      className={`h-full w-full max-w-[320px] ${compact ? "max-h-[200px]" : "max-h-[280px]"}`}
      aria-hidden
    >
      <defs>
        <radialGradient id="globeGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="110" r="78" fill="url(#globeGlow)" />

      <motion.g
        style={{ originX: "120px", originY: "110px" }}
        animate={slowRotate(36)}
      >
        <ellipse
          cx="120"
          cy="110"
          rx="72"
          ry="72"
          fill="none"
          stroke="#334155"
          strokeWidth="1"
          opacity="0.6"
        />
        <ellipse
          cx="120"
          cy="110"
          rx="72"
          ry="28"
          fill="none"
          stroke="#475569"
          strokeWidth="0.75"
          opacity="0.5"
        />
        <ellipse
          cx="120"
          cy="110"
          rx="28"
          ry="72"
          fill="none"
          stroke="#475569"
          strokeWidth="0.75"
          opacity="0.5"
        />
        <line
          x1="48"
          y1="110"
          x2="192"
          y2="110"
          stroke="#334155"
          strokeWidth="0.5"
          opacity="0.4"
        />
      </motion.g>

      {NODES.map((node, i) => {
        const next = NODES[(i + 1) % NODES.length];
        return (
          <motion.line
            key={`link-${i}`}
            x1={node.cx}
            y1={node.cy}
            x2={next.cx}
            y2={next.cy}
            stroke="url(#arcGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0.2, 0.9, 0.2] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {NODES.map((node, i) => (
        <g key={`node-${i}`}>
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill="#06b6d4"
            opacity="0.15"
            animate={{ r: [8, 16, 8], opacity: [0.1, 0.25, 0.1] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill="#22d3ee"
            animate={pulseOpacity(0.6, 1, 2 + i * 0.2)}
          />
        </g>
      ))}

      <motion.circle
        cx="120"
        cy="110"
        r="18"
        fill="#0f172a"
        stroke="#22d3ee"
        strokeWidth="2"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "120px", originY: "110px" }}
      />
      <path
        d="M120 100 v8 m-5-4 h10"
        stroke="#67e8f9"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <motion.circle
        cx="120"
        cy="110"
        r="28"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1"
        opacity="0.4"
        animate={{ r: [28, 38, 28], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
      />
    </svg>
  );

  if (!showShell) {
    return <motion.div className={className}>{svg}</motion.div>;
  }

  return (
    <GraphicShell className={className} glow="cyan" label="Global mesh">
      {svg}
    </GraphicShell>
  );
}
