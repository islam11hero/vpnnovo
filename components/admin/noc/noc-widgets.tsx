"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { GrowthRadarChart } from "@/components/admin/noc/growth-radar-chart";
import { NocCrmTable } from "@/components/admin/noc/noc-crm-table";
import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import { NocFinancialStrip } from "@/components/admin/noc/noc-financial-strip";
import { NocFleetPanel } from "@/components/admin/noc/noc-fleet-panel";
import {
  ChartSkeleton,
  CrmTableSkeleton,
  FinancialStripSkeleton,
  FleetPanelSkeleton,
  HealthSkeleton,
} from "@/components/admin/noc/noc-skeletons";
import { useNocRefresh } from "@/components/admin/noc/noc-refresh-context";
import { NocWidgetFallback } from "@/components/admin/noc/noc-widget-fallback";
import { SystemHealthNoc } from "@/components/admin/noc/system-health-noc";
import type { AdminNodeRow } from "@/lib/admin-nodes";
import {
  EMPTY_BANDWIDTH,
  EMPTY_FINANCIAL,
  EMPTY_FLEET,
  EMPTY_HEALTH,
  emptyGrowthChart,
} from "@/lib/noc-fallbacks";
import type {
  NocBandwidthMetrics,
  NocFinancialMetrics,
  NocFleetMetrics,
  NocGrowthPoint,
  NocHealthMetrics,
} from "@/lib/noc-types";
import { useNocQuery } from "@/lib/use-noc-query";

const finUrl = (k: number) => `/api/admin/noc/financial?_=${k}`;
const fleetUrl = (k: number) => `/api/admin/noc/fleet?_=${k}`;
const chartUrl = (k: number) => `/api/admin/noc/chart?_=${k}`;
const healthUrl = (k: number) => `/api/admin/noc/health?_=${k}`;
const nodesUrl = (k: number) => `/api/admin/nodes?_=${k}`;

export function FinancialWidget() {
  const { refreshKey } = useNocRefresh();
  const { loading, data, error, reload } = useNocQuery<{
    financial: NocFinancialMetrics;
    bandwidth: NocBandwidthMetrics;
  }>(finUrl, refreshKey);

  if (loading) return <FinancialStripSkeleton />;
  if (error || !data) {
    return (
      <NocWidgetFallback message={error ?? "Financial API unreachable"} onRetry={reload} />
    );
  }

  return (
    <NocFinancialStrip
      financial={data.financial ?? EMPTY_FINANCIAL}
      bandwidth={data.bandwidth ?? EMPTY_BANDWIDTH}
    />
  );
}

export function FleetWidget({ onNukeClick }: { onNukeClick?: () => void }) {
  const { refreshKey } = useNocRefresh();
  const { loading, data, error, reload } = useNocQuery<{ fleet: NocFleetMetrics }>(
    fleetUrl,
    refreshKey,
  );

  if (loading) return <FleetPanelSkeleton />;
  if (error || !data) {
    return (
      <NocWidgetFallback message={error ?? "Fleet API unreachable"} onRetry={reload} />
    );
  }

  return <NocFleetPanel fleet={data.fleet ?? EMPTY_FLEET} onNukeClick={onNukeClick} />;
}

export function ChartWidget() {
  const { refreshKey } = useNocRefresh();
  const { loading, data, error, reload } = useNocQuery<{ chart: NocGrowthPoint[] }>(
    chartUrl,
    refreshKey,
  );

  if (loading) return <ChartSkeleton />;
  if (error) {
    return (
      <NocWidgetFallback message={error} onRetry={reload} />
    );
  }

  const chart = data?.chart ?? emptyGrowthChart();
  const hasRevenue = chart.some((d) => d.revenue > 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
      <h2 className="text-sm font-bold tracking-wide text-white uppercase">
        7-Day Revenue
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Paid Supabase orders — live settlement curve
      </p>
      {!hasRevenue ? (
        <NocEmptyState
          compact
          title="Awaiting First Deployment"
          description="Revenue chart will populate after your first paid checkout."
        />
      ) : (
        <div className="mt-6">
          <GrowthRadarChart data={chart} />
        </div>
      )}
    </div>
  );
}

export function HealthWidget({ showRefresh = false }: { showRefresh?: boolean }) {
  const { refreshKey, refreshing, refreshTelemetry } = useNocRefresh();
  const { loading, data, error, reload } = useNocQuery<{ health: NocHealthMetrics }>(
    healthUrl,
    refreshKey,
  );

  if (loading) return <HealthSkeleton />;

  const health = data?.health ?? EMPTY_HEALTH;

  return (
    <div>
      {showRefresh ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => {
              void refreshTelemetry().then(() =>
                toast.success("Telemetry refreshed", {
                  description: "Vultr · Marzban · Supabase cache invalidated.",
                }),
              );
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh Telemetry
          </button>
        </div>
      ) : null}
      {error ? (
        <NocWidgetFallback
          message={error}
          onRetry={reload}
          title="Health telemetry delayed"
        />
      ) : null}
      <SystemHealthNoc health={health} />
    </div>
  );
}

export function ClientsWidget(props: {
  searchQuery: string;
  processingKey: string | null;
  onAction: Parameters<typeof NocCrmTable>[0]["onAction"];
  onRequestRevoke: (orderId: string) => void;
}) {
  const { refreshKey } = useNocRefresh();
  const { loading, data, error, reload } = useNocQuery<{
    nodes: AdminNodeRow[];
    telemetryUnreachable?: boolean;
  }>(nodesUrl, refreshKey);

  if (loading) return <CrmTableSkeleton />;
  if (error) {
    return (
      <NocWidgetFallback
        message={error}
        onRetry={reload}
        title="Client Control offline"
      />
    );
  }

  const nodes = data?.nodes ?? [];
  const q = props.searchQuery.trim().toLowerCase();
  const filtered = q
    ? nodes.filter(
        (n) =>
          (n.marzbanUsername?.toLowerCase().includes(q) ?? false) ||
          n.orderId.toLowerCase().includes(q) ||
          n.planName.toLowerCase().includes(q),
      )
    : nodes;

  if (!nodes.length && !q) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <NocEmptyState />
      </div>
    );
  }

  return (
    <NocCrmTable
      nodes={filtered}
      searchQuery={props.searchQuery}
      processingKey={props.processingKey}
      onAction={props.onAction}
      onRequestRevoke={props.onRequestRevoke}
    />
  );
}
