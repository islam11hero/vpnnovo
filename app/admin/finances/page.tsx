import { Clock, DollarSign, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import { formatUsd, netProfitValueClass } from "@/lib/format-currency";
import {
  computeMrrFromPaidOrders,
  loadVultrPendingCharges,
} from "@/lib/noc-live-metrics";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function StatusBadge({ status }: { status: SupabaseOrder["status"] }) {
  const styles = {
    paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    failed: "border-red-500/40 bg-red-500/10 text-red-400",
    underpaid: "border-orange-500/40 bg-orange-500/10 text-orange-400",
    revoked: "border-slate-600 bg-slate-800 text-slate-400",
  } as const;

  const labels = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    underpaid: "Underpaid",
    revoked: "Revoked",
  } as const;

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default async function AdminFinancesPage() {
  let rows: SupabaseOrder[] = [];
  let supabaseOnline = false;

  const db = getSupabaseAdminResult();
  if (db.ok) {
    try {
      const { data: orders, error } = await db.client
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        rows = (orders ?? []) as SupabaseOrder[];
        supabaseOnline = true;
      } else {
        console.error("[admin:finances]", error.message);
      }
    } catch (e) {
      console.error("[admin:finances]", e);
    }
  } else {
    console.error("[admin:finances]", db.error);
  }

  const paidOrders = rows.filter((o) => o.status === "paid");
  const mrr = computeMrrFromPaidOrders(paidOrders);
  const vultrBilling = await loadVultrPendingCharges();
  const netProfit = mrr - (vultrBilling.online ? vultrBilling.pending : 0);

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + Number(o.amount),
    0,
  );
  const pendingCount = rows.filter((o) => o.status === "pending").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase">
          Financial NOC
        </p>
        <h1 className="mt-1 font-poppins text-3xl font-black text-white">
          Revenue & Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live Supabase ledger · Vultr pending charges
          {!supabaseOnline ? " · Supabase offline" : ""}
          {!vultrBilling.online ? " · Vultr offline" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                Net Profit (MRR − Vultr)
              </p>
              <h3
                className={`mt-2 text-3xl font-black tabular-nums ${netProfitValueClass(netProfit)}`}
              >
                {formatUsd(netProfit)}
              </h3>
              <p className="mt-1 text-xs text-slate-600">MRR {formatUsd(mrr)}</p>
            </div>
            <Wallet className="h-8 w-8 text-emerald-500/80" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                Pending
              </p>
              <h3 className="mt-2 text-3xl font-black text-white">
                {pendingCount}
              </h3>
            </div>
            <Clock className="h-8 w-8 text-amber-500/80" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                Total Paid Revenue
              </p>
              <h3 className="mt-2 text-3xl font-black tabular-nums text-white">
                {formatUsd(totalRevenue)}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {paidOrders.length} paid
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-cyan-500/80" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-sm font-bold text-white uppercase">Recent Orders</h2>
        </div>
        {rows.length === 0 ? (
          <NocEmptyState compact title="Awaiting First Deployment" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">VPN Username</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/50">
                    <td className="px-5 py-3.5 font-mono text-xs text-cyan-400/90">
                      {shortId(order.id)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      {order.plan_name}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">
                      {formatUsd(Number(order.amount))}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {order.vpn_username ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
