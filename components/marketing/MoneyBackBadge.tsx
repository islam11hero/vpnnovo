"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";

export function MoneyBackBadge() {
  return (
    <section className="px-6 pb-20" aria-labelledby="money-back-heading">
      <motion.div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-950/20 px-8 py-10 text-center md:flex-row md:text-left"
          >
            <div className="relative hidden h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-emerald-500/20 md:block lg:h-36 lg:w-56">
              <Image
                src="/marketing/marketing-crypto-trust.png"
                alt="Instant crypto activation and 30-day guarantee"
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
            <motion.div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(16,185,129,0)",
                  "0 0 24px 4px rgba(16,185,129,0.25)",
                  "0 0 0 0 rgba(16,185,129,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShieldCheck className="h-10 w-10 text-emerald-400" aria-hidden />
            </motion.div>
            <div>
              <h2
                id="money-back-heading"
                className="font-poppins text-2xl font-bold text-white md:text-3xl"
              >
                30-day money-back guarantee
              </h2>
              <p className="mt-2 text-base font-medium text-slate-400">
                Enjoy full access risk-free. If IPNOVA is not the right fit within 30
                days and usage is under 1 GB, contact support for a crypto refund review.
              </p>
            </div>
          </motion.div>
        </RevealOnScroll>
      </motion.div>
    </section>
  );
}
