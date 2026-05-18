"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Shield, X } from "lucide-react";

import { DEPLOYMENT_PLATFORMS } from "@/components/marketing/os-icons";

const NAV_LINKS = [
  { href: "#bento", label: "Architecture" },
  { href: "#experts", label: "Proof" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function MarketingHeader() {
  const [deployOpen, setDeployOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
        aria-label="Primary"
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 p-2 shadow-lg shadow-cyan-500/10 transition group-hover:shadow-cyan-500/25">
            <Shield className="h-6 w-6 text-cyan-400" aria-hidden />
          </div>
          <span className="font-poppins text-2xl font-black tracking-tight text-white">
            IPNOVA
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <motion.div
            className="relative"
            onMouseEnter={() => setDeployOpen(true)}
            onMouseLeave={() => setDeployOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
              aria-expanded={deployOpen}
              aria-haspopup="true"
            >
              Apps / Deployments
              <ChevronDown
                className={`h-4 w-4 transition ${deployOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {deployOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full z-50 mt-2 w-[520px] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl"
                  role="menu"
                >
                  <p className="mb-4 text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
                    Client deployments
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {DEPLOYMENT_PLATFORMS.map((p) => (
                      <a
                        key={p.id}
                        href={p.href}
                        role="menuitem"
                        className="group flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3 transition hover:border-cyan-500/40 hover:bg-slate-800"
                      >
                        <p.Icon className="h-7 w-7 text-slate-400 transition group-hover:text-cyan-400" />
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white">
                          {p.label}
                        </span>
                      </a>
                    ))}
                  </div>
                  <p className="mt-4 border-t border-slate-700/60 pt-4 text-xs font-medium text-slate-500">
                    VLESS Vision · sing-box · v2rayNG · Clash Meta profiles ship
                    post-checkout.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/portal"
            className="text-sm font-bold text-slate-400 transition hover:text-cyan-300"
          >
            Client Portal
          </Link>
          <a
            href="#pricing"
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
          >
            <span className="relative z-10">Deploy Node Now</span>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition hover:opacity-100" />
          </a>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800 lg:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              <p className="px-2 py-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                Deployments
              </p>
              {DEPLOYMENT_PLATFORMS.map((p) => (
                <a
                  key={p.id}
                  href={p.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-800"
                  onClick={() => setMobileOpen(false)}
                >
                  <p.Icon className="h-5 w-5 text-slate-500" />
                  {p.label}
                </a>
              ))}
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-800"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/portal"
                className="block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-400"
              >
                Client Portal
              </Link>
              <a
                href="#pricing"
                className="mt-2 block rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-center text-sm font-black text-white"
              >
                Deploy Node Now
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
