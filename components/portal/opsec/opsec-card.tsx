import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  icon: LucideIcon;
  accent?: "cyan" | "violet" | "emerald" | "orange" | "red";
  children: React.ReactNode;
  className?: string;
};

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  cyan: "text-cyan-500/90",
  violet: "text-violet-400/90",
  emerald: "text-emerald-400/90",
  orange: "text-orange-400/90",
  red: "text-red-400/90",
};

export function OpsecCard({
  title,
  icon: Icon,
  accent = "cyan",
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur-md ${className}`}
    >
      <h3
        className={`mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase ${ACCENT[accent]}`}
      >
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

export function OpsecBlockedBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
      Scanner Blocked by Extension
    </span>
  );
}
