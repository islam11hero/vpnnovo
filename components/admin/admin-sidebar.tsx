"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  CreditCard,
  Radar,
  Settings,
  LogOut,
  Globe,
  UserPlus,
  Headphones,
} from "lucide-react";

import { ADMIN_ROUTES } from "@/lib/admin-access";

const navItems = [
  { href: ADMIN_ROUTES.overview, label: "Overview", icon: LayoutDashboard, match: "/admin" },
  {
    href: ADMIN_ROUTES.accounts,
    label: "Registered",
    icon: UserPlus,
    match: "/admin/accounts",
  },
  { href: ADMIN_ROUTES.clients, label: "VPN Clients", icon: Users, match: "/admin/clients" },
  {
    href: ADMIN_ROUTES.support,
    label: "Support",
    icon: Headphones,
    match: "/admin/support",
  },
  { href: ADMIN_ROUTES.finances, label: "Finances", icon: CreditCard, match: "/admin/finances" },
  {
    href: ADMIN_ROUTES.proxies,
    label: "Proxy Queue",
    icon: Globe,
    match: "/admin/proxies",
  },
  {
    href: ADMIN_ROUTES.monitoring,
    label: "Monitoring",
    icon: Radar,
    match: "/admin/monitoring",
  },
  { href: ADMIN_ROUTES.settings, label: "Settings", icon: Settings, match: "/admin/settings" },
] as const;

function isActive(pathname: string, match: string) {
  if (match === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname.startsWith(match);
}

type Props = {
  onLogout?: () => void;
};

export function AdminSidebar({ onLogout }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/80 bg-[#0F172A]/95 backdrop-blur-xl md:flex">
      <div className="flex h-20 items-center border-b border-slate-800/50 px-6">
        <Shield className="mr-3 h-8 w-8 text-[#3B82F6]" />
        <span className="text-xl font-bold tracking-tight text-white">
          IPNOVA
          <span className="mt-0.5 block text-[10px] tracking-widest text-slate-500 uppercase">
            Command Center
          </span>
        </span>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                active
                  ? "bg-[#3B82F6] text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-slate-800/50 p-4">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-white"
        >
          Exit to Store
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
