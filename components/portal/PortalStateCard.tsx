import type { ReactNode } from "react";

type Variant = "default" | "warning" | "error";

const BORDER: Record<Variant, string> = {
  default: "border-slate-800",
  warning: "border-amber-500/30",
  error: "border-red-500/30",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function PortalStateCard({
  children,
  variant = "default",
  className = "",
}: Props) {
  return (
    <div
      className={`mx-auto max-w-lg rounded-2xl border ${BORDER[variant]} bg-slate-900/90 p-10 text-center shadow-xl shadow-black/40 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
