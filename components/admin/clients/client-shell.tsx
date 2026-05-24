import Link from "next/link";

import { ClientsPageHeader } from "@/components/admin/clients/clients-page-header";
import {
  loadAdminClientsShell,
  loadPendingOrdersForAdmin,
} from "@/lib/admin-clients-loader";

export function ClientShell() {
  return <ClientsPageHeader />;
}

export async function ClientShellWithOrders() {
  const [shell, pendingSummary] = await Promise.all([
    loadAdminClientsShell(),
    loadPendingOrdersForAdmin(),
  ]);

  return (
    <>
      <ClientsPageHeader />
      {shell.ok ? (
        <p className="text-xs text-slate-500">
          {shell.orders.length} provisioned order(s) in Supabase — loading live
          Marzban telemetry…
        </p>
      ) : (
        <p className="text-xs text-amber-400/90">
          Supabase cache unavailable — attempting Marzban only.
        </p>
      )}
      {pendingSummary.ok &&
      (pendingSummary.pending > 0 ||
        pendingSummary.underpaid > 0 ||
        pendingSummary.failed > 0) ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-xs text-amber-100">
          <span className="font-bold tracking-wide uppercase">Unsettled payments</span>
          {pendingSummary.pending > 0 ? (
            <span>{pendingSummary.pending} pending</span>
          ) : null}
          {pendingSummary.underpaid > 0 ? (
            <span>{pendingSummary.underpaid} underpaid</span>
          ) : null}
          {pendingSummary.failed > 0 ? (
            <span>{pendingSummary.failed} failed</span>
          ) : null}
          <Link
            href="/admin/finances"
            className="ml-auto font-bold text-cyan-300 hover:underline"
          >
            Open Finances →
          </Link>
        </div>
      ) : null}
    </>
  );
}
