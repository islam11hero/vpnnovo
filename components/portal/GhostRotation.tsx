"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Loader2, Skull } from "lucide-react";

const ROTATION_STEPS = [
  "Invalidating old UUID…",
  "Cryptographically generating new keys…",
  "Syncing with Node…",
];

type Props = {
  orderId: string;
  disabled?: boolean;
  onRotated: (newLink: string) => void;
};

export function GhostRotation({ orderId, disabled, onRotated }: Props) {
  const [phase, setPhase] = useState<"idle" | "burning" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 5000);
  };

  const handleBurn = useCallback(async () => {
    const confirmed = window.confirm(
      "🔥 BURN & ROTATE\n\nThis permanently invalidates your current subscription URL. All devices using the old link will disconnect immediately.\n\nProceed with identity rotation?",
    );
    if (!confirmed) return;

    setPhase("burning");
    setError(null);
    setNewLink(null);
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ROTATION_STEPS.length - 1));
    }, 1100);

    try {
      const res = await fetch("/api/client/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        new_link?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.new_link) {
        throw new Error(data.error ?? "Rotation failed");
      }

      setNewLink(data.new_link);
      onRotated(data.new_link);
      setPhase("done");
      showToast("Identity successfully rotated. Old connections dropped.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotation failed");
      setPhase("idle");
    } finally {
      clearInterval(stepTimer);
    }
  }, [orderId, onRotated]);

  return (
    <div className="relative">
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-emerald-500/50 bg-emerald-950/95 px-5 py-4 text-sm font-bold text-emerald-300 shadow-2xl shadow-emerald-500/25 backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 p-6 shadow-2xl shadow-red-500/15 md:p-8">
        <motion.div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-500/25 blur-3xl"
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-rose-500/15 blur-3xl"
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.5 }}
        />

        <div className="relative">
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5 text-red-400" />
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
              Ghost Mode
            </p>
          </div>
          <h3 className="mt-2 font-poppins text-xl font-bold text-white">
            Identity Rotation
          </h3>
          <p className="mt-2 text-sm font-medium text-zinc-400">
            Burner link rotation — invalidate leaked URLs instantly. Old sessions
            drop within seconds; no portal reload required.
          </p>

          <button
            type="button"
            onClick={() => void handleBurn()}
            disabled={disabled || phase === "burning"}
            className="relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-red-400/70 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5 text-base font-black tracking-wide text-white shadow-lg shadow-red-500/50 transition hover:border-red-300 hover:shadow-red-500/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
            {phase === "burning" ? (
              <Loader2 className="relative h-6 w-6 animate-spin" />
            ) : (
              <Flame className="relative h-6 w-6" />
            )}
            <span className="relative drop-shadow-[0_0_12px_rgba(248,113,113,0.8)]">
              Burn &amp; Rotate Identity
            </span>
          </button>

          {phase === "burning" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 rounded-xl border border-red-500/30 bg-black/50 p-4 font-mono text-sm text-red-300"
            >
              <p className="animate-pulse">{ROTATION_STEPS[stepIndex]}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : null}

          {error ? (
            <p className="mt-4 text-center text-sm font-bold text-red-400">
              {error}
            </p>
          ) : null}

          {newLink && phase === "done" ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4"
            >
              <p className="mb-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                New burner link (live)
              </p>
              <p className="break-all font-mono text-xs text-emerald-200">
                {newLink}
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
