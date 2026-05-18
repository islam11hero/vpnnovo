"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Terminal } from "lucide-react";

import { OpsecCard } from "@/components/portal/opsec/opsec-card";
import {
  runFingerprintAudit,
  type FingerprintAudit,
} from "@/lib/opsec-fingerprint";

type ScanState =
  | { status: "loading" }
  | { status: "ok"; audit: FingerprintAudit };

function TerminalLine({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-x-2 font-mono text-xs leading-relaxed">
      <span className="text-emerald-500/80">$</span>
      <span className="text-slate-500">{label}</span>
      <span className={ok ? "text-emerald-400" : "text-amber-400"}>{value}</span>
    </div>
  );
}

export function DeepFingerprintAuditor() {
  const [scan, setScan] = useState<ScanState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void runFingerprintAudit().then((audit) => {
      if (!cancelled) setScan({ status: "ok", audit });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OpsecCard
      title="Hardware & TLS Fingerprint"
      icon={Terminal}
      accent="emerald"
      className="lg:col-span-2"
    >
      {scan.status === "loading" ? (
        <div className="flex items-center gap-3 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="text-sm">Auditing Canvas hash & TLS client hints…</span>
        </div>
      ) : null}

      {scan.status === "ok" ? (
        <div className="rounded-lg border border-slate-800 bg-black/60 p-4 font-mono text-xs shadow-inner">
          <p className="mb-3 text-[10px] text-slate-600">
            ipnova-opsec@clean-room:~
          </p>
          <TerminalLine
            label="Hardware Canvas Spoofing:"
            value={
              scan.audit.canvasSpoofingActive ? "Active" : "Not detected"
            }
            ok={scan.audit.canvasSpoofingActive}
          />
          <TerminalLine
            label="TLS JA4 Signature:"
            value={scan.audit.tlsJa4Label}
            ok={
              scan.audit.isAntiDetectBrowser ||
              scan.audit.tlsJa4Label.includes("Organic")
            }
          />
          <div className="mt-3 border-t border-slate-800 pt-3">
            <p className="text-[10px] text-slate-600">canvas_sha256</p>
            <p className="mt-1 break-all text-slate-500">
              {scan.audit.canvasHash}
            </p>
          </div>

          {scan.audit.warning ? (
            <div className="mt-4 flex gap-2 rounded border border-amber-500/30 bg-amber-950/20 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <p className="font-sans text-xs leading-relaxed text-amber-100/90">
                {scan.audit.warning}
              </p>
            </div>
          ) : (
            <p className="mt-4 font-sans text-xs text-emerald-400/90">
              Anti-detect profile signals look consistent for paid traffic ops.
            </p>
          )}
        </div>
      ) : null}
    </OpsecCard>
  );
}
