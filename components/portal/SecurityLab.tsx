"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Loader2,
  Radar,
  Shield,
  ShieldAlert,
} from "lucide-react";

import { GhostRotation } from "@/components/portal/GhostRotation";
import {
  collectBrowserIdentityVectors,
  type BrowserIdentityVectors,
} from "@/lib/browser-fingerprint";
import { runSecurityScan, type SecurityScanResult } from "@/lib/security-lab";

type ScanPhase = "idle" | "scanning" | "done";

type Props = {
  orderId: string;
  canRotate: boolean;
  onSubLinkRotated: (newLink: string) => void;
};

const SCAN_STEPS = [
  "Initializing ICE probe…",
  "Parsing WebRTC candidates…",
  "Testing IPv6-only egress…",
  "Harvesting browser identity vectors…",
];

function IdentityVectorRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/50 p-4">
      <p className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-medium text-zinc-200 ${mono ? "break-all font-mono text-xs" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export function SecurityLab({ orderId, canRotate, onSubLinkRotated }: Props) {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<SecurityScanResult | null>(null);
  const [vectors, setVectors] = useState<BrowserIdentityVectors | null>(null);
  const [vectorsLoading, setVectorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void collectBrowserIdentityVectors().then((v) => {
      if (!cancelled) {
        setVectors(v);
        setVectorsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runScan = useCallback(async () => {
    setPhase("scanning");
    setResult(null);
    setError(null);
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, 850);

    try {
      const [scanResult, freshVectors] = await Promise.all([
        runSecurityScan(),
        collectBrowserIdentityVectors(),
      ]);
      setResult(scanResult);
      setVectors(freshVectors);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
      setPhase("idle");
    } finally {
      clearInterval(stepTimer);
    }
  }, []);

  const isStealth =
    phase === "done" && result && !result.webrtcLeak && !result.ipv6Leak;

  return (
    <div className="space-y-6">
      <GhostRotation
        orderId={orderId}
        disabled={!canRotate}
        onRotated={onSubLinkRotated}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-700/80 bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30"
            animate={{ boxShadow: ["0 0 0px #22c55e00", "0 0 24px #22c55e33", "0 0 0px #22c55e00"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Shield className="h-8 w-8 text-emerald-400" />
          </motion.div>
          <div>
            <h3 className="font-poppins text-xl font-bold text-white">
              Anti-Detect Browser Audit
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
              Deep leak probe + browser identity vectors for AdsPower / Dolphin
              before launching Facebook Ads.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void runScan()}
          disabled={phase === "scanning"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-6 py-4 text-sm font-bold text-emerald-300 transition hover:bg-emerald-600/30 disabled:opacity-60 sm:w-auto"
        >
          {phase === "scanning" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Radar className="h-5 w-5" />
          )}
          ▶ Run Deep Security Scan
        </button>
      </motion.div>

      <div className="rounded-2xl border border-zinc-700/80 bg-slate-950 p-6 md:p-8">
        <motion.div className="mb-4 flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-violet-400" />
          <h4 className="font-poppins text-lg font-bold text-white">
            Browser Identity Vectors
          </h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-3 rounded-xl border-2 border-red-500/50 bg-red-950/40 px-4 py-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm font-semibold leading-relaxed text-red-100">
            If your Canvas Hash remains static across sessions, Stripe/Facebook AI
            will track you regardless of your VPN IP. Use an Anti-Detect browser to
            spoof these vectors.
          </p>
        </motion.div>

        {vectorsLoading ? (
          <div className="flex items-center gap-3 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Sampling canvas / WebGL / audio…</span>
          </div>
        ) : vectors ? (
          <div className="grid gap-3 md:grid-cols-2">
            <IdentityVectorRow label="Canvas Hash" value={vectors.canvasHash} />
            <IdentityVectorRow
              label="WebGL Renderer (unmasked)"
              value={vectors.webglRenderer}
              mono={false}
            />
            <IdentityVectorRow
              label="WebGL Vendor (unmasked)"
              value={vectors.webglVendor}
              mono={false}
            />
            <IdentityVectorRow
              label="AudioContext Hash"
              value={vectors.audioHash}
            />
          </div>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {phase === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-8 backdrop-blur-xl"
          >
            <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full border border-emerald-500/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Radar className="h-10 w-10 text-emerald-400" />
            </div>
            <p className="text-center font-mono text-sm font-bold text-emerald-400">
              {SCAN_STEPS[stepIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-sm font-bold text-red-300">
          {error}
        </div>
      ) : null}

      {phase === "done" && result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {isStealth ? (
            <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/80 to-slate-950 p-10 text-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
              <p className="mt-4 font-poppins text-2xl font-black text-emerald-300 md:text-3xl">
                100% STEALTH
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-400">
                Safe to launch ads
              </p>
            </div>
          ) : null}

          {result.webrtcLeak ? (
            <div className="rounded-2xl border-2 border-red-500/50 bg-red-950/30 p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 shrink-0 text-red-400" />
                <div>
                  <p className="font-bold text-red-300">WebRTC Leak Detected</p>
                  <p className="mt-2 text-sm text-red-200/90">
                    Exposed: {result.webrtcLocalIps.join(", ")}. Disable WebRTC in
                    AdsPower settings.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {result.ipv6Leak ? (
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-950/20 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400" />
                <div>
                  <p className="font-bold text-amber-200">IPv6 Route Active</p>
                  <p className="mt-2 text-sm text-amber-100/80">
                    {result.ipv6Address ?? "IPv6 detected"} — disable IPv6 on your
                    network adapter.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
