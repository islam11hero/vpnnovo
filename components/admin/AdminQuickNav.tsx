import Link from "next/link";
import {
  CreditCard,
  Globe,
  LayoutDashboard,
  Headphones,
  Radar,
  UserPlus,
  Users,
} from "lucide-react";

import { ADMIN_ROUTES } from "@/lib/admin-access";

const LINKS = [
  {
    href: ADMIN_ROUTES.overview,
    label: "Overview",
    description: "NOC metrics & fleet health",
    icon: LayoutDashboard,
  },
  {
    href: ADMIN_ROUTES.accounts,
    label: "Registered accounts",
    description: "Clients who signed up with email",
    icon: UserPlus,
    accent: true,
  },
  {
    href: ADMIN_ROUTES.clients,
    label: "VPN clients",
    description: "Paid nodes & Marzban control",
    icon: Users,
  },
  {
    href: ADMIN_ROUTES.support,
    label: "Support inbox",
    description: "Reply to client tickets",
    icon: Headphones,
    accent: true,
  },
  {
    href: ADMIN_ROUTES.proxies,
    label: "Proxy queue",
    description: "Deliver crypto proxy orders",
    icon: Globe,
  },
  {
    href: ADMIN_ROUTES.finances,
    label: "Finances",
    description: "All orders & payment status",
    icon: CreditCard,
  },
  {
    href: ADMIN_ROUTES.monitoring,
    label: "Monitoring",
    description: "Abuse & bandwidth alerts",
    icon: Radar,
  },
] as const;

export function AdminQuickNav() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 md:p-6">
      <div className="mb-4">
        <h2 className="font-poppins text-sm font-bold tracking-wide text-white uppercase">
          Quick access
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Jump to the workspace you need — bookmark{" "}
          <span className="font-mono text-slate-400">/admin/login</span> for faster
          entry.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-start gap-3 rounded-xl border p-4 transition ${
                "accent" in item && item.accent
                  ? "border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-500/50"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  "accent" in item && item.accent
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-700 bg-slate-950 text-slate-400 group-hover:text-cyan-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-white group-hover:text-cyan-100">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
