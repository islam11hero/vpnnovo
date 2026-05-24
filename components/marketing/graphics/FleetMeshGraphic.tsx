"use client";

import { motion } from "framer-motion";

import { GraphicShell } from "@/components/marketing/graphics/GraphicShell";

type Props = {
  className?: string;
  showShell?: boolean;
};

const MESH_NODES = [
  { id: "hub", cx: 120, cy: 110, r: 10 },
  { id: "n1", cx: 55, cy: 70, r: 6 },
  { id: "n2", cx: 185, cy: 65, r: 6 },
  { id: "n3", cx: 200, cy: 140, r: 6 },
  { id: "n4", cx: 45, cy: 150, r: 6 },
  { id: "n5", cx: 120, cy: 45, r: 5 },
  { id: "n6", cx: 120, cy: 175, r: 5 },
] as const;

const EDGES: [string, string][] = [
  ["hub", "n1"],
  ["hub", "n2"],
  ["hub", "n3"],
  ["hub", "n4"],
  ["hub", "n5"],
  ["hub", "n6"],
  ["n1", "n5"],
  ["n2", "n5"],
  ["n3", "n6"],
  ["n4", "n6"],
];

export function FleetMeshGraphic({ className = "", showShell = true }: Props) {
  const nodeMap = Object.fromEntries(MESH_NODES.map((n) => [n.id, n]));

  const svg = (
    <svg
      viewBox="0 0 240 220"
      className="h-full w-full max-h-[280px] max-w-[320px]"
      aria-hidden
    >
      <defs>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="110" r="70" fill="url(#hubGlow)" />

      {EDGES.map(([a, b], i) => {
        const na = nodeMap[a];
        const nb = nodeMap[b];
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={na.cx}
            y1={na.cy}
            x2={nb.cx}
            y2={nb.cy}
            stroke="#475569"
            strokeWidth="1"
            animate={{ opacity: [0.25, 0.7, 0.25] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {EDGES.map(([a, b], i) => {
        const na = nodeMap[a];
        const nb = nodeMap[b];
        return (
          <motion.circle
            key={`pulse-${a}-${b}`}
            r="3"
            fill="#fbbf24"
            animate={{
              cx: [na.cx, nb.cx, na.cx],
              cy: [na.cy, nb.cy, na.cy],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {MESH_NODES.map((node) => (
        <g key={node.id}>
          {node.id === "hub" ? (
            <>
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 8}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
                animate={{ r: [node.r + 6, node.r + 18, node.r + 6], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="#451a03"
                stroke="#fbbf24"
                strokeWidth="2"
              />
            </>
          ) : (
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="#1e293b"
              stroke="#94a3b8"
              strokeWidth="1.5"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: node.cx / 100,
                ease: "easeInOut",
              }}
              style={{ originX: `${node.cx}px`, originY: `${node.cy}px` }}
            />
          )}
        </g>
      ))}

      <motion.text
        x="120"
        y="205"
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.15em"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        FLEET MESH · AUTO-ROTATE
      </motion.text>
    </svg>
  );

  if (!showShell) return svg;

  return (
    <GraphicShell className={className} glow="amber" label="B2B fleet">
      {svg}
    </GraphicShell>
  );
}
