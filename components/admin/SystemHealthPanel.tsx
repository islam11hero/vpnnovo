"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Globe,
  Loader2,
  Server,
  Shield,
  XCircle,
} from "lucide-react";

type HealthData = {
  marzban_online: boolean;
  site_url: string;
  admin_edge_auth: boolean;
  zero_log_tickets: boolean;
};

export function SystemHealthPanel() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      const json = (await res.json()) as HealthData & {
        success?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Health check failed");
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Health check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center rounded-3xl border border-slate-200/60 bg-white/90 py-24 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-sm backdrop-blur-sm">
        <div className="mb-8 flex items-center gap-3">
          <Activity className="h-7 w-7 text-[#3B82F6]" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Diagnostics &amp; Security
            </h2>
            <p className="text-sm text-slate-500">
              Live infrastructure status for the Command Center
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Server className="h-5 w-5 text-slate-500" />
              <p className="text-sm font-bold text-slate-800">
                Marzban API Connection
              </p>
            </div>
            {data?.marzban_online ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                <XCircle className="h-4 w-4" />
                Offline
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-500" />
              <p className="text-sm font-bold text-slate-800">Site URL Config</p>
            </div>
            <p className="break-all font-mono text-sm font-medium text-slate-700">
              {data?.site_url ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-500" />
              <p className="text-sm font-bold text-slate-800">Security Check</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                  data?.admin_edge_auth
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {data?.admin_edge_auth ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Admin Edge Auth Active
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                  data?.zero_log_tickets
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {data?.zero_log_tickets ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Zero-Log Tickets Active
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Re-run diagnostics
        </button>
      </div>
    </div>
  );
}
