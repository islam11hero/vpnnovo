"use client";

import { motion } from "framer-motion";

import { EncryptionShieldGraphic } from "@/components/marketing/graphics/EncryptionShieldGraphic";
import { FleetMeshGraphic } from "@/components/marketing/graphics/FleetMeshGraphic";
import { LatencyWaveGraphic } from "@/components/marketing/graphics/LatencyWaveGraphic";
import { NetworkGlobeGraphic } from "@/components/marketing/graphics/NetworkGlobeGraphic";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { fadeUp, staggerContainer } from "@/lib/motion-presets";

const SHOWCASE = [
  {
    Graphic: NetworkGlobeGraphic,
    title: "Global edge mesh",
    description:
      "Premium Gulf & China routes with automatic failover — no buffering, no dropped VoIP.",
  },
  {
    Graphic: EncryptionShieldGraphic,
    title: "Zero-trust encryption",
    description:
      "AES-256 tunneling with tracker blocking — your traffic stays invisible to ISPs.",
  },
  {
    Graphic: LatencyWaveGraphic,
    title: "Sub-20ms latency",
    description:
      "Optimized paths for WhatsApp calls, streaming, and real-time ad verification.",
  },
  {
    Graphic: FleetMeshGraphic,
    title: "Enterprise fleet mesh",
    description:
      "Dedicated clean IPs, auto-rotation, and SOCKS export for AdsPower & automation.",
  },
] as const;

export function InfrastructureShowcase() {
  return (
    <section
      id="infrastructure"
      className="relative overflow-hidden border-y border-slate-800/80 bg-slate-950 px-6 py-20 md:py-28"
      aria-labelledby="infrastructure-heading"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mb-14 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Live infrastructure
          </p>
          <h2
            id="infrastructure-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            Built for speed, stealth &amp; scale
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-slate-400">
            Four core capabilities — animated in real time. The same stack powering
            personal VPN and enterprise proxy fleets.
          </p>
        </RevealOnScroll>

        <motion.div
          className="grid gap-6 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {SHOWCASE.map(({ Graphic, title, description }, i) => (
            <motion.article
              key={title}
              variants={fadeUp}
              className="flex flex-col gap-4"
            >
              <Graphic />
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
              >
                <h3 className="font-poppins text-lg font-bold text-white md:text-xl">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-400">
                  {description}
                </p>
              </motion.div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
