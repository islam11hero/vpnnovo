"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Database,
  Loader2,
  Server,
  XCircle,
} from "lucide-react";

type TableCheck = {
  table: string;
  ok: boolean;
  error?: string;
};

type HealthData = {
  isSupabaseConfigured: boolean;
  isMarzbanConfigured: boolean;
  marzban_online: boolean;
  site_url: string;
  nowpayments_configured: boolean;
  database_schema_ok: boolean;
  orders_telemetry_columns: boolean;
  database_tables: TableCheck[];
  database_error: string | null;
};

function StatusPill({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/40 bg-red-500/10 text-red-300"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

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
      <div className="flex justify-center rounded-2xl border border-slate-800 bg-slate-950/60 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="font-poppins text-lg font-bold text-white">
                Production diagnostics
              </h2>
              <p className="text-xs text-slate-500">
                Env vars + database schema (run after Vercel redeploy)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400"
          >
            Refresh
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <StatusPill
            ok={Boolean(data?.isSupabaseConfigured)}
            label="Supabase env"
          />
          <StatusPill
            ok={Boolean(data?.isMarzbanConfigured)}
            label="Marzban env"
          />
          <StatusPill
            ok={Boolean(data?.marzban_online)}
            label="Marzban online"
          />
          <StatusPill
            ok={Boolean(data?.nowpayments_configured)}
            label="NOWPayments IPN"
          />
          <StatusPill
            ok={Boolean(data?.database_schema_ok)}
            label="DB schema"
          />
          <StatusPill
            ok={Boolean(data?.orders_telemetry_columns)}
            label="Telemetry columns"
          />
        </div>

        <p className="mb-4 font-mono text-xs text-slate-500">
          Site: {data?.site_url ?? "—"}
        </p>

        {data?.database_error ? (
          <p className="mb-4 text-xs text-amber-400">{data.database_error}</p>
        ) : null}

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-300">
            <Database className="h-4 w-4 text-cyan-400" />
            Supabase tables
          </div>
          <ul className="space-y-2">
            {(data?.database_tables ?? []).map((row) => (
              <li
                key={row.table}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="font-mono text-slate-400">{row.table}</span>
                {row.ok ? (
                  <span className="font-bold text-emerald-400">OK</span>
                ) : (
                  <span className="max-w-[60%] truncate text-red-400" title={row.error}>
                    Missing
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {!data?.database_schema_ok ? (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-100">
            <p className="font-bold">Action required in Supabase SQL Editor</p>
            <p className="mt-2 text-amber-200/90">
              Run{" "}
              <code className="rounded bg-slate-950 px-1 py-0.5 font-mono text-cyan-300">
                supabase/migrations/RUN_ALL_PENDING.sql
              </code>{" "}
              from the repo, then click Refresh above.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <Server className="h-4 w-4" />
            Database schema looks ready for production traffic.
          </div>
        )}
      </div>
    </div>
  );
}
