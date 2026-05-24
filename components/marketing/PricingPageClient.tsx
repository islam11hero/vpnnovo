"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { EncryptionShieldGraphic } from "@/components/marketing/graphics/EncryptionShieldGraphic";
import { AmbientOrbs } from "@/components/marketing/motion/AmbientOrbs";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { ProxyPricing } from "@/components/marketing/ProxyPricing";
import { StandardPricing } from "@/components/marketing/StandardPricing";
import { EASE_SMOOTH } from "@/lib/motion-presets";

type TabId = "personal" | "proxy";

export function PricingPageClient() {
  const searchParams = useSearchParams();
  const defaultTab = useMemo<TabId>(() => {
    return searchParams.get("tab") === "b2b" ? "proxy" : "personal";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="relative border-b border-slate-800 bg-slate-950/95 px-6 py-16 text-center backdrop-blur-xl">
        <AmbientOrbs variant="mixed" />
        <RevealOnScroll className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase"
          >
            IPNOVA Infrastructure
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6, ease: EASE_SMOOTH }}
            className="mt-3 font-poppins text-4xl font-black text-white md:text-5xl"
          >
            Choose Your Infrastructure
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE_SMOOTH }}
            className="mx-auto mt-4 max-w-2xl text-slate-400"
          >
            Personal VPN decoy tiers for mass market — or dedicated proxy fleets for
            operators who need clean IPs at scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto mt-8 hidden max-w-[200px] opacity-60 md:block"
          >
            <EncryptionShieldGraphic showShell={false} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mt-10 inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1"
            role="tablist"
            aria-label="Pricing category"
          >
            <motion.button
              type="button"
              role="tab"
              aria-selected={activeTab === "personal"}
              onClick={() => setActiveTab("personal")}
              whileTap={{ scale: 0.97 }}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold transition ${
                activeTab === "personal"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Personal VPN
            </motion.button>
            <motion.button
              type="button"
              role="tab"
              aria-selected={activeTab === "proxy"}
              onClick={() => setActiveTab("proxy")}
              whileTap={{ scale: 0.97 }}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold transition ${
                activeTab === "proxy"
                  ? "bg-amber-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Dedicated Proxies
            </motion.button>
          </motion.div>
        </RevealOnScroll>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
      >
        {activeTab === "personal" ? <StandardPricing /> : <ProxyPricing />}
      </motion.div>
    </div>
  );
}
