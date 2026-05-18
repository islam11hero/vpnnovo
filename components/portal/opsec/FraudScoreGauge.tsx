"use client";

import { fraudRiskLabel } from "@/lib/opsec-ip-trust";

type Props = {
  score: number;
  size?: number;
};

export function FraudScoreGauge({ score, size = 112 }: Props) {
  const risk = fraudRiskLabel(score);
  const stroke =
    risk === "safe"
      ? "#34d399"
      : risk === "elevated"
        ? "#fb923c"
        : "#f87171";
  const glow =
    risk === "safe"
      ? "rgba(52,211,153,0.45)"
      : risk === "elevated"
        ? "rgba(251,146,60,0.4)"
        : "rgba(248,113,113,0.45)";

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(30 41 59)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 8px ${glow})`,
            transition: "stroke-dashoffset 0.8s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-2xl font-black tabular-nums"
          style={{ color: stroke }}
        >
          {score}
        </span>
        <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
          Fraud Risk
        </span>
      </div>
    </div>
  );
}
