"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Globe,
  Headphones,
  LayoutDashboard,
  UserPlus,
  Users,
} from "lucide-react";

import { ADMIN_ROUTES } from "@/lib/admin-access";

const ITEMS = [
  { href: ADMIN_ROUTES.overview, label: "Home", icon: LayoutDashboard },
  { href: ADMIN_ROUTES.accounts, label: "Accounts", icon: UserPlus },
  { href: ADMIN_ROUTES.clients, label: "VPN", icon: Users },
  { href: ADMIN_ROUTES.support, label: "Help", icon: Headphones },
  { href: ADMIN_ROUTES.proxies, label: "Proxy", icon: Globe },
  { href: ADMIN_ROUTES.finances, label: "Pay", icon: CreditCard },
] as const;

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950 px-2 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Admin quick navigation"
    >
      {ITEMS.map((item) => {
        const active =
          item.href === ADMIN_ROUTES.overview
            ? pathname === "/admin" || pathname === "/admin/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
              active
                ? "bg-cyan-600 text-white"
                : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
