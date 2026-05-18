"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Radar } from "lucide-react";

type IpifyResponse = { ip?: string };

export function LiveNetworkStatus() {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchIp() {
      try {
        const res = await fetch("https://api.ipify.org?format=json", {
          cache: "no-store",
        });
        const data = (await res.json()) as IpifyResponse;
        if (!cancelled) {
          setIp(data.ip ?? "Unknown");
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Could not reach IP check service");
          setIp(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchIp();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-xl md:p-8">
      <div className="mb-4 flex items-center gap-2">
        <Radar className="h-5 w-5 text-[#3B82F6]" />
        <h3 className="font-poppins text-lg font-bold text-slate-900">
          Live IP Leak Radar
        </h3>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/90 to-white/80 p-5 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#3B82F6]" />
            <span className="text-sm font-medium">Scanning your egress IP…</span>
          </div>
        ) : error ? (
          <p className="text-sm font-medium text-amber-700">{error}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Globe className="h-8 w-8 text-[#3B82F6]" />
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Your current public IP
              </p>
              <p className="font-mono text-2xl font-bold text-slate-900">{ip}</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
        If this IP belongs to our Spanish node, you are securely routed. If you see
        your home ISP address, your VPN is disconnected or leaking — reconnect in the{" "}
        <strong className="text-slate-900">Connection</strong> tab.
      </p>
    </div>
  );
}
