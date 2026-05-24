"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ChevronRight } from "lucide-react";

import { FleetMeshGraphic } from "@/components/marketing/graphics/FleetMeshGraphic";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";

export function BusinessBanner() {
  return (
    <section className="px-6 py-10" aria-labelledby="business-banner-heading">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-950 to-cyan-950/30"
          >
            <motion.div
              className="grid gap-8 p-8 md:grid-cols-[1fr_auto_280px] md:items-center md:p-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10"
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Building2 className="h-7 w-7 text-cyan-400" aria-hidden />
                </motion.div>
                <div>
                  <h2
                    id="business-banner-heading"
                    className="font-poppins text-xl font-bold text-white md:text-2xl"
                  >
                    Looking for a VPN for business?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-400">
                    Secure your corporate network and marketing fleet with IPNOVA B2B
                    dedicated proxies, clean ISPs, and fleet auto-rotation.
                  </p>
                </div>
              </div>

              <Link
                href="/pricing?tab=b2b"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-600/20 px-6 py-3.5 text-sm font-black text-cyan-100 transition hover:bg-cyan-600/40 md:justify-self-start"
              >
                View Proxy/B2B Pricing
                <ChevronRight className="h-4 w-4" />
              </Link>

              <div className="hidden md:block">
                <FleetMeshGraphic showShell={false} />
              </div>
            </motion.div>
          </motion.div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
