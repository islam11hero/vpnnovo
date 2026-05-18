import Link from "next/link";
import { Shield } from "lucide-react";

import {
  AndroidIcon,
  AppleIcon,
  DEPLOYMENT_PLATFORMS,
  LinuxIcon,
  WindowsIcon,
} from "@/components/marketing/os-icons";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-access";

const FOOTER_COLUMNS = [
  {
    title: "VPN Apps",
    links: [
      { label: "Windows Client", href: "#deploy-windows" },
      { label: "macOS Profile", href: "#deploy-macos" },
      { label: "Linux / Qubes", href: "#deploy-linux" },
      { label: "iOS Configuration", href: "#deploy-ios" },
      { label: "Android v2rayNG", href: "#deploy-android" },
    ],
  },
  {
    title: "Advanced Features",
    links: [
      { label: "Anti-DPI Stealth", href: "#bento" },
      { label: "RAM-Only Nodes", href: "#bento" },
      { label: "Multi-Hop Cascade", href: "#bento" },
      { label: "Post-Quantum Handshake", href: "#bento" },
      { label: "Threat Radar", href: "#bento" },
    ],
  },
  {
    title: "Free OPSEC Tools",
    links: [
      { label: "DNS Leak Probe", href: "#footer" },
      { label: "WebRTC Audit", href: "#footer" },
      { label: "Fingerprint Lab", href: "/portal" },
      { label: "Config Generator", href: "#footer" },
      { label: "Kill-Switch Test", href: "#footer" },
    ],
  },
  {
    title: "Legal / Privacy",
    links: [
      { label: "Zero-Log Policy", href: "#footer" },
      { label: "Warrant Canary", href: "#footer" },
      { label: "Transparency Report", href: "#footer" },
      { label: "GDPR Data Rights", href: "#footer" },
      { label: "Subpoena Response", href: "#footer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About IPNOVA", href: "#footer" },
      { label: "Infrastructure", href: "#bento" },
      { label: "Affiliate Program", href: "#footer" },
      { label: "Client Portal", href: "/portal" },
      { label: "Admin", href: ADMIN_LOGIN_PATH },
    ],
  },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 pt-20 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Shield className="h-7 w-7 text-cyan-400" aria-hidden />
              <span className="font-poppins text-xl font-black text-white">IPNOVA</span>
            </Link>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-500">
              Cyber-elite VPN infrastructure for privacy whales, red teams, and
              operators who refuse surveillance-by-default.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-labelledby={`footer-${col.title}`}>
              <h3
                id={`footer-${col.title}`}
                className="mb-4 text-sm font-bold tracking-wide text-white"
              >
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-slate-500 transition hover:text-cyan-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-10">
          <p className="mb-6 text-center text-xs font-bold tracking-[0.2em] text-slate-600 uppercase">
            Deploy on every surface
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <WindowsIcon className="h-8 w-8 text-slate-600 transition hover:text-slate-300" />
            <AppleIcon className="h-8 w-8 text-slate-600 transition hover:text-slate-300" />
            <LinuxIcon className="h-8 w-8 text-slate-600 transition hover:text-slate-300" />
            <AndroidIcon className="h-8 w-8 text-slate-600 transition hover:text-slate-300" />
            {DEPLOYMENT_PLATFORMS.map((p) => (
              <a
                key={p.id}
                href={p.href}
                className="text-xs font-bold text-slate-600 transition hover:text-cyan-400"
                aria-label={p.label}
              >
                {p.id}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs font-medium text-slate-600">
          © {year} IPNOVA Technologies. Zero logs by architecture. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
