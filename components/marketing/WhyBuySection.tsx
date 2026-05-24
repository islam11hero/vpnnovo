"use client";

import { motion } from "framer-motion";
import { Eye, Globe, Lock } from "lucide-react";

import { EncryptionShieldGraphic } from "@/components/marketing/graphics/EncryptionShieldGraphic";
import { LatencyWaveGraphic } from "@/components/marketing/graphics/LatencyWaveGraphic";
import { NetworkGlobeGraphic } from "@/components/marketing/graphics/NetworkGlobeGraphic";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { fadeUp, staggerContainer } from "@/lib/motion-presets";

const PILLARS = [
  {
    emoji: "🔒",
    icon: Lock,
    title: "Protect your privacy",
    description:
      "Block trackers, hide your IP from advertisers, and keep browsing data private on any network.",
    accent: "from-cyan-500/10 to-transparent",
  },
  {
    emoji: "🛡️",
    icon: Eye,
    title: "Stay safe online",
    description:
      "Secure banking sessions, block malware domains, and shield your devices on public Wi‑Fi.",
    accent: "from-emerald-500/10 to-transparent",
  },
  {
    emoji: "🌍",
    icon: Globe,
    title: "Access content anywhere",
    description:
      "Route through premium global nodes, bypass regional restrictions, and verify campaigns from any GEO.",
    accent: "from-blue-500/10 to-transparent",
  },
] as const;

export function WhyBuySection() {
  return (
    <section
      id="why-buy"
      className="relative overflow-hidden border-y border-slate-800/80 bg-slate-950 px-6 py-20"
      aria-labelledby="why-buy-heading"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mb-12 text-center">
          <h2
            id="why-buy-heading"
            className="font-poppins text-3xl font-black text-white md:text-4xl"
          >
            Why buy IPNOVA?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-slate-400">
            The same psychological clarity as tier-one VPN brands — privacy, safety,
            and freedom in one stack.
          </p>
        </RevealOnScroll>

        <motion.div
          className="mb-12 hidden gap-4 md:grid md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="opacity-80">
            <EncryptionShieldGraphic showShell={false} />
          </motion.div>
          <motion.div variants={fadeUp} className="opacity-80">
            <LatencyWaveGraphic showShell={false} />
          </motion.div>
          <motion.div variants={fadeUp} className="opacity-80">
            <NetworkGlobeGraphic compact showShell={false} />
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
        >
          {PILLARS.map((item) => (
            <motion.article
              key={item.title}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md transition hover:border-cyan-500/25"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition group-hover:opacity-100`}
                aria-hidden
              />
              <motion.div
                className="relative mb-4 flex items-center gap-3"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10"
                  animate={{ boxShadow: ["0 0 0 0 rgba(6,182,212,0)", "0 0 20px 2px rgba(6,182,212,0.2)", "0 0 0 0 rgba(6,182,212,0)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <item.icon className="h-5 w-5 text-cyan-400" aria-hidden />
                </motion.div>
              </motion.div>
              <h3 className="relative font-poppins text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="relative mt-3 text-sm font-medium leading-relaxed text-slate-400">
                {item.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
