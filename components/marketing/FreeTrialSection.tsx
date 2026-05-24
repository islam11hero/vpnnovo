"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Gauge,
  KeyRound,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/CopyButton";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { EASE_SMOOTH } from "@/lib/motion-presets";
import { generateTrialDeviceHash } from "@/lib/trial-device-hash";

const TRIAL_PERKS = [
  { icon: Clock, label: "24h access" },
  { icon: Gauge, label: "1 GB data" },
  { icon: Shield, label: "VLESS stealth" },
  { icon: Zap, label: "No card" },
] as const;

export function FreeTrialSection() {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTrial = async () => {
    setLoading(true);
    setError(null);

    try {
      const deviceHash = await generateTrialDeviceHash();
      const res = await fetch("/api/checkout/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceHash }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        order_id?: string;
        error?: string;
        fraud?: boolean;
      };

      if (!res.ok || !data.success || !data.order_id) {
        const message =
          data.error ??
          "Could not activate your trial. Please try again or choose a paid plan.";
        setError(message);
        toast.error(message);
        return;
      }

      setOrderId(data.order_id);
      toast.success("Trial activated — save your Order ID.");
    } catch {
      const message = "Network error. Check your connection and try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="free-trial"
      className="relative scroll-mt-20 overflow-hidden border-b border-slate-800/60 px-6 py-10 md:py-12"
      aria-labelledby="free-trial-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(6,182,212,0.08),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl">
        <RevealOnScroll>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="text-center md:max-w-md md:text-left">
              <motion.div
                className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(6,182,212,0)",
                    "0 0 16px 2px rgba(6,182,212,0.12)",
                    "0 0 0 0 rgba(6,182,212,0)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Limited free trial
              </motion.div>

              <h2
                id="free-trial-heading"
                className="font-poppins text-2xl font-black text-white md:text-3xl"
              >
                1-Day Free Trial
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                24 hours · 1 GB · one trial per device. No payment required.
              </p>
            </div>

            <ul className="flex flex-wrap justify-center gap-2 md:max-w-sm md:justify-end">
              {TRIAL_PERKS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>

        <AnimatePresence mode="wait">
          {orderId ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE_SMOOTH }}
              className="mx-auto mt-6 max-w-lg rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-5"
            >
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-poppins text-base font-bold text-white">
                    Trial activated
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Save your Order ID for portal access.
                  </p>
                  <p className="mt-3 break-all rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-cyan-300">
                    {orderId}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyButton text={orderId} label="Copy Order ID" />
                    <Link
                      href={`/portal/${orderId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-black text-white"
                    >
                      Go to Portal
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="mt-6 flex flex-col items-center gap-2 md:mt-5"
            >
              <motion.button
                type="button"
                onClick={startTrial}
                disabled={loading}
                whileHover={loading ? undefined : { scale: 1.02 }}
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Provisioning…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" aria-hidden />
                    Start 1-Day Free Trial
                  </>
                )}
              </motion.button>

              <p className="text-[11px] font-medium text-slate-500">
                One trial per device &amp; network.
              </p>

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex max-w-sm items-start gap-2 text-xs font-medium text-amber-400"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {error}
                </motion.p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
