"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";

const STATS = [
  { value: "195+", label: "GEO routes" },
  { value: "<5 min", label: "Avg. activation" },
  { value: "24/7", label: "Portal support" },
  { value: "VLESS", label: "Reality stealth" },
] as const;

const QUOTES = [
  {
    text: "Finally a crypto checkout that gives a portal link — no waiting on email.",
    role: "Media buyer · UAE",
  },
  {
    text: "AdsPower SOCKS5 worked first import. Proxy queue was filled same day.",
    role: "Affiliate team · EU",
  },
  {
    text: "Trial to paid was one click. v2rayNG QR in the vault is clean.",
    role: "Remote dev · KSA",
  },
] as const;

export function SocialProofStrip() {
  return (
    <section
      className="px-6 py-16"
      aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <h2 id="social-proof-heading" className="sr-only">
            Customer trust
          </h2>
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-5 text-center"
              >
                <p className="font-poppins text-2xl font-black text-cyan-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {QUOTES.map((quote) => (
            <blockquote
              key={quote.role}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <div className="mb-3 flex gap-0.5 text-amber-400" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-300">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-3 text-xs font-bold text-slate-500">
                {quote.role}
              </footer>
            </blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
