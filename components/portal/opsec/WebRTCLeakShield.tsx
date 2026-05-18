"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Radar, Shield } from "lucide-react";

import { detectWebRtcLeak } from "@/lib/security-lab";

type ScanState =
  | { status: "scanning" }
  | { status: "unsupported" }
  | { status: "secure" }
  | { status: "leak"; ips: string[] };

export function WebRTCLeakShield() {
  const [scan, setScan] = useState<ScanState>({ status: "scanning" });
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (scan.status !== "scanning") return;
    const id = setInterval(() => setPulse((p) => p + 1), 600);
    return () => clearInterval(id);
  }, [scan.status]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (typeof RTCPeerConnection === "undefined") {
        if (!cancelled) setScan({ status: "unsupported" });
        return;
      }

      const result = await detectWebRtcLeak();
      if (cancelled) return;

      if (result.leaked) {
        setScan({ status: "leak", ips: result.localIps });
      } else {
        setScan({ status: "secure" });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur-md">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-violet-400/90 uppercase">
        <Radar className="h-4 w-4" />
        WebRTC Leak Shield
      </h3>

      <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center">
        <span
          className={`absolute inset-0 rounded-full border border-cyan-500/20 ${
            scan.status === "scanning" ? "animate-ping" : ""
          }`}
          style={{ animationDuration: "2s" }}
        />
        <span
          className="absolute inset-2 rounded-full border border-violet-500/30"
          style={{
            transform: `rotate(${pulse * 45}deg)`,
            transition: "transform 0.6s linear",
          }}
        />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
          {scan.status === "scanning" ? (
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          ) : scan.status === "secure" ? (
            <Shield className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          ) : (
            <AlertTriangle className="h-7 w-7 text-red-400" />
          )}
        </span>
      </div>

      {scan.status === "scanning" ? (
        <p className="text-center text-sm font-medium text-slate-400">
          Scanning ICE candidates for LAN leaks…
        </p>
      ) : null}

      {scan.status === "unsupported" ? (
        <p className="text-center text-sm text-slate-500">
          WebRTC API unavailable in this browser context.
        </p>
      ) : null}

      {scan.status === "secure" ? (
        <p className="text-center text-sm font-bold text-emerald-400">
          WebRTC Secured (Zero Leaks)
        </p>
      ) : null}

      {scan.status === "leak" ? (
        <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-center">
          <p className="text-sm font-bold text-red-300">
            WebRTC LEAK DETECTED
          </p>
          <p className="mt-2 text-xs text-red-200/80">
            Local IPs exposed: {scan.ips.join(", ")}. Disable WebRTC in browser
            flags (chrome://flags) or use a hardened profile.
          </p>
        </div>
      ) : null}
    </div>
  );
}
