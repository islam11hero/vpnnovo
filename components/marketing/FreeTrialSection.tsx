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
  { icon: Clock, label: "24 hours full access" },
  { icon: Gauge, label: "1 GB high-speed data" },
  { icon: Shield, label: "VLESS Vision stealth" },
  { icon: Zap, label: "Instant — no card required" },
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
      className="relative scroll-mt-24 overflow-hidden px-6 py-20 md:py-28"
      aria-labelledby="free-trial-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(6,182,212,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <RevealOnScroll>
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300"
            animate={{ boxShadow: ["0 0 0 0 rgba(6,182,212,0)", "0 0 24px 4px rgba(6,182,212,0.15)", "0 0 0 0 rgba(6,182,212,0)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Limited free trial
          </motion.div>

          <h2
            id="free-trial-heading"
            className="font-poppins text-3xl font-black text-white md:text-5xl"
          >
            1-Day Free Trial
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
            Test IPNOVA risk-free for 24 hours. Full stealth tunnel, 1 GB cap — one
            trial per device. No payment details required.
          </p>
        </RevealOnScroll>

        <motion.ul
          className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {TRIAL_PERKS.map(({ icon: Icon, label }) => (
            <motion.li
              key={label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: EASE_SMOOTH },
                },
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-300"
            >
              <Icon className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
              {label}
            </motion.li>
          ))}
        </motion.ul>

        <AnimatePresence mode="wait">
          {orderId ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE_SMOOTH }}
              className="mx-auto mt-10 max-w-lg rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-8 text-left"
            >
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
                <motion.div>
                  <p className="font-poppins text-lg font-bold text-white">
                    Trial activated
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Save your Order ID — you&apos;ll need it to access your vault.
                  </p>
                  <p className="mt-4 break-all rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-cyan-300">
                    {orderId}
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <CopyButton text={orderId} label="Copy Order ID" className="w-full sm:w-auto" />
                    <Link
                      href={`/portal/${orderId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/25 sm:w-auto"
                    >
                      Go to My Portal
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="mt-10"
            >
              <motion.button
                type="button"
                onClick={startTrial}
                disabled={loading}
                whileHover={loading ? undefined : { scale: 1.03, y: -2 }}
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 text-lg font-black text-white shadow-2xl shadow-cyan-500/30 transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Provisioning trial…
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" aria-hidden />
                    Start 1-Day Free Trial
                  </>
                )}
              </motion.button>

              <p className="mt-4 text-xs font-medium text-slate-500">
                One trial per device &amp; network. Abuse attempts are blocked automatically.
              </p>

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-4 flex max-w-md items-start justify-center gap-2 text-left text-sm font-medium text-amber-400"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
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
