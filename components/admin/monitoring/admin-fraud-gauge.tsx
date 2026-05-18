"use client";

type Props = {
  score: number;
  size?: number;
};

export function AdminFraudGauge({ score, size = 120 }: Props) {
  const safe = score < 20;
  const elevated = score >= 20 && score < 50;
  const stroke = safe ? "#34d399" : elevated ? "#fb923c" : "#f87171";
  const glow = safe
    ? "rgba(52,211,153,0.5)"
    : elevated
      ? "rgba(251,146,60,0.45)"
      : "rgba(248,113,113,0.5)";

  const radius = (size - 10) / 2;
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
          stroke="#1e293b"
          strokeWidth={9}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 10px ${glow})`,
            transition: "stroke-dashoffset 0.6s ease",
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
          Fraud %
        </span>
      </div>
    </div>
  );
}
