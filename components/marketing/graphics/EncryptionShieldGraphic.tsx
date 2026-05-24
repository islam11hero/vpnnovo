"use client";

import { motion } from "framer-motion";

import { GraphicShell } from "@/components/marketing/graphics/GraphicShell";

type Props = {
  className?: string;
  showShell?: boolean;
};

const PACKETS = [
  { x: 40, y: 60, delay: 0 },
  { x: 200, y: 80, delay: 0.6 },
  { x: 55, y: 170, delay: 1.2 },
  { x: 185, y: 155, delay: 1.8 },
] as const;

export function EncryptionShieldGraphic({
  className = "",
  showShell = true,
}: Props) {
  const svg = (
    <svg
      viewBox="0 0 240 220"
      className="h-full w-full max-h-[280px] max-w-[320px]"
      aria-hidden
    >
      <defs>
        <linearGradient id="shieldFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {[0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx="120"
          cy="115"
          rx={55 + i * 22}
          ry={40 + i * 16}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          opacity={0.15 - i * 0.03}
          animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.28, 0.12] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{ originX: "120px", originY: "115px" }}
        />
      ))}

      <motion.path
        d="M120 35 L185 62 V115 C185 155 120 185 120 185 C120 185 55 155 55 115 V62 Z"
        fill="url(#shieldFill)"
        stroke="#22d3ee"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.rect
        x="105"
        y="95"
        width="30"
        height="38"
        rx="4"
        fill="#0f172a"
        stroke="#67e8f9"
        strokeWidth="2"
        animate={{ y: [95, 92, 95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M120 108 C115 108 112 111 112 115 C112 122 120 128 120 128 C120 128 128 122 128 115 C128 111 125 108 120 108 Z"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {PACKETS.map((p, i) => (
        <motion.g key={i}>
          <motion.rect
            x={p.x}
            y={p.y}
            width="14"
            height="10"
            rx="2"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1"
            animate={{
              x: [p.x, 120, p.x],
              y: [p.y, 115, p.y],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
          <motion.text
            x={p.x + 3}
            y={p.y + 8}
            fill="#64748b"
            fontSize="6"
            fontFamily="monospace"
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: p.delay }}
          >
            AES
          </motion.text>
        </motion.g>
      ))}

      <motion.path
        d="M75 115 Q120 85 165 115"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        animate={{ strokeDashoffset: [0, -40] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );

  if (!showShell) return svg;

  return (
    <GraphicShell className={className} glow="emerald" label="Zero-trust">
      {svg}
    </GraphicShell>
  );
}
