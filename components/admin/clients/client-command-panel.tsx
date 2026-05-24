import { ClientCommandTable } from "@/components/admin/clients/client-command-table";
import { ClientMetricsStrip } from "@/components/admin/clients/client-metrics-strip";
import { TelemetryDelayedBadge } from "@/components/admin/clients/telemetry-delayed-badge";
import type { AdminClientsTelemetryPayload } from "@/lib/admin-clients-loader";
import { computeClientGridMetrics } from "@/lib/marzban-client-metrics";

type Props = {
  payload: AdminClientsTelemetryPayload;
};

export function ClientCommandPanel({ payload }: Props) {
  const metrics = computeClientGridMetrics(payload.rows);

  return (
    <div className="space-y-6">
      {payload.telemetryDelayed ? (
        <div className="flex flex-wrap items-center gap-3">
          <TelemetryDelayedBadge />
          {payload.error ? (
            <span className="text-xs text-slate-500">{payload.error}</span>
          ) : null}
        </div>
      ) : null}
      <ClientMetricsStrip
        metrics={metrics}
        marzbanOnline={payload.marzbanOnline}
        error={payload.error}
      />
      <ClientCommandTable rows={payload.rows} />
    </div>
  );
}
