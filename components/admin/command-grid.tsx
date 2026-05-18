"use client";

import { Loader2, Settings2, ShieldBan, Trash2 } from "lucide-react";

import type { MarzbanAdminAction } from "@/lib/marzban";
import {
  formatTraffic,
  isActiveStatus,
  type MarzbanUser,
} from "@/lib/marzban-users";

function usagePercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

type Props = {
  users: MarzbanUser[];
  allUsersCount: number;
  searchQuery: string;
  processingUser: string | null;
  onAction: (username: string, action: MarzbanAdminAction) => void;
};

export function CommandGrid({
  users,
  allUsersCount,
  searchQuery,
  processingUser,
  onAction,
}: Props) {
  const isProcessing = (username: string, action: MarzbanAdminAction) =>
    processingUser === `${username}:${action}`;

  if (allUsersCount === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/90 p-12 text-center shadow-sm backdrop-blur-sm">
        <p className="text-sm font-medium text-slate-500">
          No Marzban clients yet. Provision a shield from the storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
      <div className="border-b border-slate-200/60 bg-slate-50/80 p-6">
        <h2 className="text-lg font-bold text-slate-800">
          Command Grid (Client Management)
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Live Marzban control — reset usage, suspend, or remove nodes.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200/80 bg-white text-xs tracking-wider text-slate-400 uppercase">
              <th className="p-5 font-bold">Client Identity</th>
              <th className="p-5 font-bold">Data Utilization</th>
              <th className="p-5 font-bold">Shield Status</th>
              <th className="p-5 text-right font-bold">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No clients match &ldquo;{searchQuery}&rdquo;. Try another
                    username.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const used = user.used_traffic ?? 0;
                const limit = user.data_limit ?? 0;
                const active = isActiveStatus(user.status);
                const pct = usagePercent(used, limit);
                const atCap = limit > 0 && used >= limit;
                const rowBusy =
                  processingUser?.startsWith(`${user.username}:`) ?? false;

                return (
                  <tr
                    key={user.username}
                    className="transition-colors duration-200 hover:bg-slate-50"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${
                            active
                              ? "bg-emerald-500 shadow-emerald-500/50"
                              : "bg-red-500 shadow-red-500/50"
                          }`}
                        />
                        <span className="font-bold text-slate-800">
                          {user.username}
                        </span>
                      </div>
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
                          active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {statusLabel(user.status)}
                      </span>
                      {user.note ? (
                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                          {user.note}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => onAction(user.username, "reset_usage")}
                          className="rounded-xl border border-transparent p-2 text-slate-400 transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Reset usage"
                        >
                          {isProcessing(user.username, "reset_usage") ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Settings2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() =>
                            onAction(user.username, "toggle_status")
                          }
                          className="rounded-xl border border-transparent p-2 text-slate-400 transition-all hover:border-amber-100 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            active
                              ? "Suspend connection"
                              : "Activate connection"
                          }
                        >
                          {isProcessing(user.username, "toggle_status") ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldBan className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() => onAction(user.username, "delete")}
                          className="rounded-xl border border-transparent p-2 text-red-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete user permanently"
                        >
                          {isProcessing(user.username, "delete") ? (
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
