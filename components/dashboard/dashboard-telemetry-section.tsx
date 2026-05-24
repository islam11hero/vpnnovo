import { OpsecVault } from "@/components/dashboard/OpsecVault";
import { loadClientDashboardTelemetry } from "@/lib/client-dashboard-loader";
import type { ClientDashboardShell } from "@/lib/client-dashboard-loader";

type Props = {
  shell: ClientDashboardShell;
};

export async function DashboardTelemetrySection({ shell }: Props) {
  const payload = await loadClientDashboardTelemetry(shell);
  const marzbanUsername =
    payload.telemetry?.username ??
    payload.marzbanUsername ??
    payload.order.marzban_username ??
    payload.order.vpn_username ??
    "";

  return (
    <OpsecVault
      order={payload.order}
      telemetry={payload.telemetry}
      telemetryLive={payload.telemetryLive}
      telemetryDelayed={payload.telemetryDelayed}
      subscriptionUrl={payload.subscriptionUrl}
      adsPowerProxy={payload.adsPowerProxy}
      activeOrders={payload.activeOrders}
      walletBalanceUsd={payload.walletBalanceUsd}
      marzbanUsername={marzbanUsername}
      proxyOrders={payload.proxyOrders}
      userId={payload.userId}
    />
  );
}
