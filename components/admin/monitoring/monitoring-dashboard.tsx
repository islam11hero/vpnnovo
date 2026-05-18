"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Radar, RefreshCw } from "lucide-react";

import { AbuseAlertsTerminal } from "@/components/admin/monitoring/abuse-alerts-terminal";
import { BandwidthConsumersTable } from "@/components/admin/monitoring/bandwidth-consumers-table";
import { CoreOperationsWidget } from "@/components/admin/monitoring/core-operations-widget";
import { IpReputationWidget } from "@/components/admin/monitoring/ip-reputation-widget";
import { MonitoringPageSkeleton } from "@/components/admin/monitoring/monitoring-skeletons";
import { NetworkPerformanceWidget } from "@/components/admin/monitoring/network-performance-widget";
import { ResourceMetricsChart } from "@/components/admin/monitoring/resource-metrics-chart";
import type { MonitoringPayload } from "@/lib/monitoring-types";

export function MonitoringDashboard() {
  const [payload, setPayload] = useState<MonitoringPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/monitoring", { cache: "no-store" });
      const json = (await res.json()) as {
        success?: boolean;
        data?: MonitoringPayload;
        error?: string;
      };

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error ?? "Telemetry unavailable");
      }

      setPayload(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load monitoring data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(true), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !payload) {
    return <MonitoringPageSkeleton />;
  }

  if (error && !payload) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-8 text-center">
        <p className="text-sm font-bold text-red-300">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Retry telemetry
        </button>
      </div>
    );
  }

  if (!payload) {
    return <MonitoringPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-cyan-500/80 uppercase">
            <Radar className="h-4 w-4" />
            Infrastructure NOC
          </p>
          <h1 className="font-poppins text-2xl font-bold tracking-tight text-white md:text-3xl">
            Abuse &amp; Telemetry Monitoring
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Clean-room IP reputation, live resource graphs, Marzban bandwidth
            ranking, and emergency bare-metal actions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-cyan-500/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`}
          />
          Refresh Telemetry
        </button>
      </header>

      {error ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-2 text-xs text-amber-200">
          Partial refresh failed: {error}
        </p>
      ) : null}

      <p className="flex items-center gap-2 font-mono text-[10px] text-slate-600">
        <Activity className="h-3 w-3" />
        Last sync: {new Date(payload.fetchedAt).toLocaleString()}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <IpReputationWidget data={payload.ipReputation} />
        </div>
        <div className="lg:col-span-8">
          <ResourceMetricsChart data={payload.resourceSeries} />
        </div>
        <div className="lg:col-span-6">
          <NetworkPerformanceWidget data={payload.network} />
        </div>
        <div className="lg:col-span-6">
          <AbuseAlertsTerminal alerts={payload.abuseAlerts} />
        </div>
        <div className="lg:col-span-8">
          <BandwidthConsumersTable
            rows={payload.topConsumers}
            marzbanOnline={payload.marzbanOnline}
          />
        </div>
        <div className="lg:col-span-4">
          <CoreOperationsWidget
            consumers={payload.topConsumers}
            onRefresh={() => void load(true)}
          />
        </div>
      </div>
    </div>
  );
}
