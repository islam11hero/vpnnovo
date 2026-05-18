"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Network, Radar } from "lucide-react";

import {
  OpsecBlockedBadge,
  OpsecCard,
} from "@/components/portal/opsec/opsec-card";
import { probeDnsLeakStatus } from "@/lib/opsec-dns";
import { detectIpv6Leak } from "@/lib/security-lab";

type DnsState =
  | { status: "loading" }
  | { status: "blocked" }
  | { status: "masked" }
  | { status: "leak"; egress: string; resolver: string };

type Ipv6State =
  | { status: "loading" }
  | { status: "masked" }
  | { status: "leak"; address: string };

function MiniRadar({
  label,
  state,
}: {
  label: string;
  state: "loading" | "safe" | "warn" | "blocked";
}) {
  const ring =
    state === "safe"
      ? "border-emerald-500/40 text-emerald-400"
      : state === "warn"
        ? "border-red-500/40 text-red-400"
        : state === "blocked"
          ? "border-slate-600 text-slate-500"
          : "border-cyan-500/30 text-cyan-400";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border bg-slate-900/80 ${ring}`}
      >
        {state === "loading" ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <Radar className="h-7 w-7" />
        )}
        {state === "loading" ? (
          <span className="absolute inset-0 animate-ping rounded-full border border-cyan-500/20" />
        ) : null}
      </div>
      <p className="mt-3 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        {label}
      </p>
    </div>
  );
}

export function DNSAndIPv6Auditor() {
  const [dns, setDns] = useState<DnsState>({ status: "loading" });
  const [ipv6, setIpv6] = useState<Ipv6State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const [dnsResult, ipv6Result] = await Promise.all([
        probeDnsLeakStatus(),
        detectIpv6Leak(),
      ]);

      if (cancelled) return;

      if (dnsResult.status === "blocked") {
        setDns({ status: "blocked" });
      } else if (dnsResult.status === "leak") {
        setDns({
          status: "leak",
          egress: dnsResult.egressIp ?? "—",
          resolver: dnsResult.resolverIp ?? "—",
        });
      } else {
        setDns({ status: "masked" });
      }

      if (ipv6Result.leaked) {
        setIpv6({
          status: "leak",
          address: ipv6Result.ipv6Address ?? "active",
        });
      } else {
        setIpv6({ status: "masked" });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const dnsRadarState =
    dns.status === "loading"
      ? "loading"
      : dns.status === "blocked"
        ? "blocked"
        : dns.status === "leak"
          ? "warn"
          : "safe";

  const ipv6RadarState =
    ipv6.status === "loading"
      ? "loading"
      : ipv6.status === "leak"
        ? "warn"
        : "safe";

  return (
    <OpsecCard
      title="DNS & IPv6 Leak Radar"
      icon={Network}
      accent="violet"
    >
      <div className="flex justify-around gap-4 py-2">
        <MiniRadar label="DNS Leak Status" state={dnsRadarState} />
        <MiniRadar label="IPv6 Masking" state={ipv6RadarState} />
      </div>

      {dns.status === "blocked" ? (
        <div className="mt-4">
          <OpsecBlockedBadge />
        </div>
      ) : null}

      {dns.status === "masked" && ipv6.status === "masked" ? (
        <p className="mt-4 text-center text-sm font-bold text-emerald-400">
          Dual-stack leaks contained
        </p>
      ) : null}

      {dns.status === "leak" ? (
        <div className="mt-4 rounded-lg border border-orange-500/30 bg-orange-950/20 p-3 text-xs text-orange-100/80">
          <p className="font-bold text-orange-300">DNS route mismatch</p>
          <p className="mt-1 font-mono text-[10px]">
            VPN {dns.egress} · Resolver {dns.resolver}
          </p>
          <p className="mt-2">
            Use IPNOVA system DNS or disable ISP DNS overrides in your OS.
          </p>
        </div>
      ) : null}

      {ipv6.status === "leak" ? (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4 shadow-[0_0_20px_rgba(239,68,68,0.12)]">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm font-bold text-red-300">
                IPv6 Leakage Detected
              </p>
              <p className="mt-2 text-xs leading-relaxed text-red-100/80">
                Disable IPv6 in Windows/macOS network settings immediately to
                prevent deep-packet profiling. Route:{" "}
                <span className="font-mono text-red-200">{ipv6.address}</span>
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </OpsecCard>
  );
}
