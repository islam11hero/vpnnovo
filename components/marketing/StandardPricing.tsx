"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { CryptoCheckoutButton } from "@/components/marketing/CryptoCheckoutButton";
import { LatencyWaveGraphic } from "@/components/marketing/graphics/LatencyWaveGraphic";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { fadeUp, staggerContainer } from "@/lib/motion-presets";
import { B2C_TIERS } from "@/lib/marketing-pricing";

export function StandardPricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-slate-950 px-6 py-20"
      aria-labelledby="standard-pricing-heading"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Personal plans
          </p>
          <h2
            id="standard-pricing-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            Pick your protection level
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Pay instantly with USDT, BTC, or ETH via NOWPayments — no card required.
            Billed annually to minimize network fees.
          </p>
        </RevealOnScroll>

        <motion.div
          className="mb-10 hidden justify-center md:flex"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-xs opacity-70">
            <LatencyWaveGraphic showShell={false} />
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          {B2C_TIERS.map((tier) => (
            <motion.article
              key={tier.id}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.35 } }}
              className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-md ${
                tier.popular
                  ? "border-cyan-400/60 bg-slate-900/80 shadow-xl shadow-cyan-500/15 ring-1 ring-cyan-500/30 lg:scale-[1.03]"
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {tier.popular ? (
                <motion.span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-black tracking-wider text-slate-950 uppercase"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Most Popular
                </motion.span>
              ) : null}
              <h3 className="font-poppins text-2xl font-bold text-white">
                {tier.name}
              </h3>
              <p className="mt-4 font-poppins text-4xl font-black text-white md:text-5xl">
                ${tier.price.toFixed(2)}
                <span className="text-lg font-medium text-slate-500">/year</span>
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Billed annually to minimize crypto network fees
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-sm font-medium text-slate-300"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                      aria-hidden
                    />
                    {feat}
                  </li>
                ))}
              </ul>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <CryptoCheckoutButton
                  tierType="b2c"
                  tierId={tier.id}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black transition ${
                    tier.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                      : "border border-slate-700 bg-slate-800 text-white hover:border-cyan-500/40"
                  }`}
                  label={`Pay with Crypto — ${tier.name}`}
                />
              </motion.div>
              <p className="mt-3 text-center text-[11px] font-medium text-slate-600">
                Card via Stripe:{" "}
                <Link href="/gcc" className="text-cyan-500 hover:underline">
                  GCC
                </Link>
                {" · "}
                <Link href="/china" className="text-cyan-500 hover:underline">
                  China
                </Link>
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
