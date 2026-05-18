"use client";

import { Loader2, Settings2, ShieldBan, Trash2, WifiOff } from "lucide-react";

import type { AdminNodeRow } from "@/lib/admin-nodes";
import { formatTraffic, isActiveStatus } from "@/lib/marzban-users";

function usagePercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export type AdminNodeAction = "reset_usage" | "toggle_status" | "revoke";

type Props = {
  nodes: AdminNodeRow[];
  allNodesCount: number;
  searchQuery: string;
  processingKey: string | null;
  onAction: (orderId: string, action: AdminNodeAction) => void;
};

export function CommandGrid({
  nodes,
  allNodesCount,
  searchQuery,
  processingKey,
  onAction,
}: Props) {
  const isProcessing = (orderId: string, action: AdminNodeAction) =>
    processingKey === `${orderId}:${action}`;

  if (allNodesCount === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/90 p-12 text-center shadow-sm backdrop-blur-sm">
        <p className="text-sm font-medium text-slate-500">
          No VPN nodes in Supabase yet. Provision a shield from the storefront or
          Create VIP.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
      <div className="border-b border-slate-200/60 bg-slate-50/80 p-6">
        <h2 className="text-lg font-bold text-slate-800">
          Active Nodes (Supabase + Marzban)
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Orders are the source of truth; bandwidth is live from Marzban when
          reachable.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/80 bg-white text-xs tracking-wider text-slate-400 uppercase">
              <th className="p-5 font-bold">Order / Marzban User</th>
              <th className="p-5 font-bold">Plan</th>
              <th className="p-5 font-bold">Data Utilization</th>
              <th className="p-5 font-bold">Shield Status</th>
              <th className="p-5 text-right font-bold">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nodes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No nodes match &ldquo;{searchQuery}&rdquo;.
                  </p>
                </td>
              </tr>
            ) : (
              nodes.map((node) => {
                const used = node.usedTraffic;
                const limit = node.dataLimit;
                const active =
                  node.orderStatus !== "revoked" &&
                  isActiveStatus(node.marzbanStatus);
                const pct = usagePercent(used, limit);
                const atCap = limit > 0 && used >= limit;
                const rowBusy =
                  processingKey?.startsWith(`${node.orderId}:`) ?? false;
                const username =
                  node.marzbanUsername ?? "—";

                return (
                  <tr
                    key={node.orderId}
                    className="transition-colors duration-200 hover:bg-slate-50"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${
                            active
                              ? "bg-emerald-500 shadow-emerald-500/50"
                              : node.orderStatus === "revoked"
                                ? "bg-slate-400"
                                : "bg-red-500 shadow-red-500/50"
                          }`}
                        />
                        <div>
                          <span className="font-bold text-slate-800">
                            {username}
                          </span>
                          <p className="font-mono text-xs text-slate-400">
                            {node.orderId.slice(0, 8)}…
                          </p>
                        </div>
                      </div>
                      {!node.telemetryLive && node.orderStatus !== "revoked" ? (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          <WifiOff className="h-3 w-3" />
                          Telemetry offline
                        </span>
                      ) : null}
                    </td>
                    <td className="p-5 text-sm font-bold text-slate-700">
                      {node.planName}
                    </td>
                    <td className="p-5">
                      <div className="w-56 min-w-[12rem]">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            {formatTraffic(used)} used
                          </span>
                          <span className="font-medium text-slate-400">
                            {limit > 0 ? formatTraffic(limit) : "Unlimited"}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              atCap ? "bg-red-500" : "bg-[#3B82F6]"
                            }`}
                            style={{ width: `${limit > 0 ? pct : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                          node.orderStatus === "revoked"
                            ? "border-slate-300 bg-slate-100 text-slate-600"
                            : active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {node.orderStatus === "revoked"
                          ? "Revoked"
                          : statusLabel(node.marzbanStatus)}
                      </span>
                      {node.note ? (
                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                          {node.note}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={rowBusy || node.orderStatus === "revoked"}
                          onClick={() => onAction(node.orderId, "reset_usage")}
                          className="rounded-xl border border-transparent p-2 text-slate-400 transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Reset usage"
                        >
                          {isProcessing(node.orderId, "reset_usage") ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Settings2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy || node.orderStatus === "revoked"}
                          onClick={() =>
                            onAction(node.orderId, "toggle_status")
                          }
                          className="rounded-xl border border-transparent p-2 text-slate-400 transition-all hover:border-amber-100 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            active
                              ? "Suspend connection"
                              : "Activate connection"
                          }
                        >
                          {isProcessing(node.orderId, "toggle_status") ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldBan className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy || node.orderStatus === "revoked"}
                          onClick={() => onAction(node.orderId, "revoke")}
                          className="rounded-xl border border-transparent p-2 text-red-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Revoke node (delete Marzban user)"
                        >
                          {isProcessing(node.orderId, "revoke") ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
