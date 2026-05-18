"use client";

import { useEffect, useState } from "react";
import {
  Fingerprint,
  Loader2,
  Shield,
  ShieldAlert,
} from "lucide-react";

type IpGeo = {
  timezone?: string;
  city?: string;
  country_name?: string;
};

type ScanState =
  | { status: "loading" }
  | { status: "blocked" }
  | {
      status: "ok";
      hardwareTz: string;
      ipTz: string;
      locationLabel: string;
      mismatch: boolean;
    };

export function TimezoneAuditor() {
  const [scan, setScan] = useState<ScanState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const hardwareTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

        const data = (await res.json()) as IpGeo;
        const ipTz = data.timezone?.trim() || "Unknown";
        const locationLabel = [data.city, data.country_name]
          .filter(Boolean)
          .join(", ");

        const mismatch =
          Boolean(hardwareTz && ipTz && ipTz !== "Unknown") &&
          hardwareTz !== ipTz;

        if (!cancelled) {
          setScan({
            status: "ok",
            hardwareTz,
            ipTz,
            locationLabel: locationLabel || "VPN egress",
            mismatch,
          });
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
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur-md">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-cyan-500/90 uppercase">
        <Fingerprint className="h-4 w-4" />
        Timezone OPSEC Auditor
      </h3>

      {scan.status === "loading" ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          <span className="text-sm font-medium">
            Correlating hardware clock vs VPN IP…
          </span>
        </div>
      ) : null}

      {scan.status === "blocked" ? (
        <>
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
            Scanner Blocked by Browser Extension
          </span>
          <p className="mt-3 text-xs text-slate-500">
            Allow ipapi.co or disable ad-block for full timezone correlation.
          </p>
        </>
      ) : null}

      {scan.status === "ok" && scan.mismatch ? (
        <div className="rounded-xl border border-orange-500/40 bg-orange-950/30 p-4 shadow-[0_0_24px_rgba(249,115,22,0.15)]">
          <div className="flex gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-orange-400" />
            <div>
              <p className="text-sm font-bold text-orange-200">
                ⚠️ OPSEC ALERT: Hardware Timezone contradicts VPN IP Location.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-orange-100/80">
                High risk of Stripe/FB ban. Sync system clock to{" "}
                <span className="font-mono font-bold text-orange-300">
                  {scan.ipTz}
                </span>{" "}
                ({scan.locationLabel}).
              </p>
              <p className="mt-3 font-mono text-[10px] text-orange-200/70">
                Device: {scan.hardwareTz} · VPN IP: {scan.ipTz}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {scan.status === "ok" && !scan.mismatch ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
              <Shield className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">
                Timezone aligned — OPSEC safe
              </p>
              <p className="mt-1 text-xs text-emerald-200/70">
                {scan.hardwareTz} matches VPN egress ({scan.locationLabel})
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
