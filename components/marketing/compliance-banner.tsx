import { Lock, Shield, ShieldCheck } from "lucide-react";

const BADGES = [
  { label: "GDPR Compliant", icon: ShieldCheck },
  { label: "AES-256 Encryption", icon: Lock },
  { label: "SOC 2 Type II Ready Framework", icon: Shield },
] as const;

export function ComplianceBanner() {
  return (
    <div
      className="border-y border-slate-800/80 bg-slate-900/40 px-6 py-5 backdrop-blur-md"
      role="region"
      aria-label="Security and compliance certifications"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 md:gap-10">
        {BADGES.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2.5 text-sm font-bold text-slate-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10">
              <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
            </span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
