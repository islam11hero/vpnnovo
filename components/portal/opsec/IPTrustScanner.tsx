"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Globe, Loader2, Server } from "lucide-react";

import { FraudScoreGauge } from "@/components/portal/opsec/FraudScoreGauge";
import {
  OpsecBlockedBadge,
  OpsecCard,
} from "@/components/portal/opsec/opsec-card";
import {
  fraudRiskLabel,
  parseIpTrustFromIpApi,
  type IpTrustPayload,
} from "@/lib/opsec-ip-trust";

type ScanState =
  | { status: "loading" }
  | { status: "blocked" }
  | { status: "ok"; data: IpTrustPayload };

export function IPTrustScanner() {
  const [scan, setScan] = useState<ScanState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timer);

        if (!res.ok) {
          if (!cancelled) setScan({ status: "blocked" });
          return;
        }

        const raw = (await res.json()) as Record<string, unknown>;
        if (!cancelled) {
          setScan({ status: "ok", data: parseIpTrustFromIpApi(raw) });
        }
      } catch {
        if (!cancelled) setScan({ status: "blocked" });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <OpsecCard title="Threat Analysis · IP Trust" icon={Globe} accent="cyan">
      {scan.status === "loading" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Profiling egress IP reputation…</span>
        </div>
      ) : null}

      {scan.status === "blocked" ? (
        <div className="space-y-3">
          <OpsecBlockedBadge />
          <p className="text-xs text-slate-500">
            Allow ipapi.co through your blocker to score ISP fraud risk.
          </p>
        </div>
      ) : null}

      {scan.status === "ok" ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <FraudScoreGauge score={scan.data.fraudScore} />
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              <p className="font-mono text-xs text-cyan-400/90">{scan.data.ip}</p>
              <p className="font-medium text-slate-200">{scan.data.isp}</p>
              <p className="font-mono text-[10px] text-slate-500">{scan.data.asn}</p>
              <p className="text-xs text-slate-500">
                {[scan.data.city, scan.data.country].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide ${
              scan.data.connectionType === "datacenter"
                ? "border-red-500/40 bg-red-950/30 text-red-300"
                : scan.data.connectionType === "residential"
                  ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900/60 text-slate-400"
            }`}
          >
            {scan.data.connectionType === "datacenter" ? (
              <span className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5" />
                Datacenter IP — High ban risk for FB/Stripe
              </span>
            ) : scan.data.connectionType === "residential" ? (
              <span className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Residential / ISP — Clean room friendly
              </span>
            ) : (
              "Connection type unknown — verify manually"
            )}
          </div>

          {fraudRiskLabel(scan.data.fraudScore) !== "safe" ? (
            <div className="flex gap-2 rounded-lg border border-orange-500/30 bg-orange-950/20 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-orange-400" />
              <p className="text-xs text-orange-100/80">
                Elevated fraud score detected. Rotate to a residential egress IP
                before scaling paid traffic.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </OpsecCard>
  );
}
