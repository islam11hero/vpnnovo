"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Quote, ShieldCheck, Star } from "lucide-react";

const EXPERTS = [
  {
    role: "Anonymous Crypto Trader",
    badge: "Strict No-Logs Policy",
    quote:
      "I route seven-figure settlement flows through IPNOVA before touching CEX hot wallets. DPI in my jurisdiction tags every commercial VPN—this stack hasn't dropped a packet in nine months.",
    metric: "9mo uptime",
  },
  {
    role: "Red Team Pentester",
    badge: "RAM-Only Verified",
    quote:
      "We imaged the egress appliance after a paid engagement. Zero persistent artifacts—only tmpfs. That's not marketing; that's how you build infrastructure adversaries can't subpoena.",
    metric: "0 disk artifacts",
  },
  {
    role: "Privacy Advocate",
    badge: "XMR-Native Checkout",
    quote:
      "Finally a provider that treats Monero as first-class, not a footnote. Ghost UUID login means my threat model doesn't include 'what if their mail server gets breached.'",
    metric: "No email vector",
  },
  {
    role: "OPSEC Journalist",
    badge: "Anti-DPI Certified",
    quote:
      "Filed from a filtered network that blocks mainstream VPN ASNs. IPNOVA's stealth profile reads as ordinary CDN traffic—editors never knew I wasn't on hotel WiFi.",
    metric: "DPI silent",
  },
  {
    role: "DeFi Protocol Engineer",
    badge: "Post-Quantum Track",
    quote:
      "Harvest-now-decrypt-later keeps me awake. Hybrid PQ handshakes on the sovereign tier are the first VPN feature I've seen that understands 2030 adversaries.",
    metric: "PQ hybrid",
  },
  {
    role: "Threat Intelligence Lead",
    badge: "Threat Radar Active",
    quote:
      "Credential-stuffing alerts tied to my tunnel fingerprint caught a breach cycle before it hit public paste sites. That's E-E-A-T you can operationalize.",
    metric: "Early warning",
  },
] as const;

export function SocialProofSection() {
  return (
    <section
      id="experts"
      className="bg-slate-900/50 px-6 py-24"
      aria-labelledby="experts-heading"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-violet-400 uppercase">
            Vetted by experts
          </p>
          <h2
            id="experts-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            Trusted where anonymity is the product.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-400">
            Pseudonymous operators across finance, offensive security, and civil
            liberty—unified by one requirement: infrastructure that survives scrutiny.
          </p>
        </header>

        <div className="columns-1 gap-5 space-y-5 md:columns-2 lg:columns-3">
          {EXPERTS.map((expert, i) => (
            <motion.blockquote
              key={expert.role}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="break-inside-avoid rounded-2xl border border-slate-700/60 bg-slate-950/80 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-300 uppercase">
                  <BadgeCheck className="h-3 w-3" />
                  {expert.badge}
                </span>
                <span className="text-xs font-bold text-slate-500">{expert.metric}</span>
              </div>
              <Quote className="mb-3 h-6 w-6 text-cyan-500/50" aria-hidden />
              <p className="mb-6 text-sm font-medium leading-relaxed text-slate-300">
                &ldquo;{expert.quote}&rdquo;
              </p>
              <footer className="flex items-center justify-between border-t border-slate-800 pt-4">
                <cite className="text-sm font-bold not-italic text-white">
                  {expert.role}
                </cite>
                <div className="flex text-amber-400" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        <aside className="mt-12 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-slate-700/50 bg-slate-950/60 px-8 py-6">
          <ShieldCheck className="h-8 w-8 text-cyan-400" aria-hidden />
          <p className="max-w-2xl text-center text-sm font-medium text-slate-400">
            IPNOVA maintains a strict no-logs architecture audited against RAM-only
            provisioning standards. We do not monetize traffic metadata, sell user
            analytics, or participate in surveillance alliances.
          </p>
        </aside>
      </div>
    </section>
  );
}
