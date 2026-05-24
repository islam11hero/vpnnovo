"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Ban,
  CheckCircle2,
  Copy,
  Loader2,
  Pencil,
  RefreshCw,
  Settings2,
  Shield,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  adjustClientLimit,
  processCryptoRenewal,
  toggleClientSuspension,
} from "@/actions/clients";
import {
  copyMarzbanSubLinkAction,
  deleteMarzbanUserAction,
} from "@/actions/marzban-users";
import { TelemetryDelayedBadge } from "@/components/admin/clients/telemetry-delayed-badge";
import { ConfirmDestructiveDialog } from "@/components/admin/noc/confirm-destructive-dialog";
import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import {
  bandwidthPercent,
  formatExpiryLabel,
  resolveClientShieldStatus,
  type ClientShieldStatus,
} from "@/lib/marzban-client-metrics";
import type { ClientCommandRow } from "@/lib/marzban/users-bulk";
import { formatBytes } from "@/lib/formatters";

type Props = {
  rows: ClientCommandRow[];
};

const STATUS_STYLES: Record<
  ClientShieldStatus,
  { label: string; className: string }
> = {
  active: {
    label: "active",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
  },
  disabled: {
    label: "disabled",
    className: "border-red-500/40 bg-red-950/40 text-red-400",
  },
  limited: {
    label: "limited",
    className: "border-amber-500/40 bg-amber-950/30 text-amber-300",
  },
  expired: {
    label: "expired",
    className: "border-amber-500/30 bg-amber-950/20 text-amber-400",
  },
};

function BandwidthBar({ used, limit }: { used: number; limit: number }) {
  const pct = bandwidthPercent(used, limit);
  const unlimited = !limit || limit <= 0;

  return (
    <div className="min-w-[180px]">
      <div className="mb-1 flex justify-between text-[11px] font-medium">
        <span className="text-slate-400">
          {formatBytes(used)}
          {!unlimited ? ` / ${formatBytes(limit)}` : ""}
        </span>
        {!unlimited ? (
          <span className="font-mono text-cyan-500/80">{pct.toFixed(0)}%</span>
        ) : (
          <span className="text-emerald-500/80">Unlimited</span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 90
              ? "bg-red-500"
              : pct >= 70
                ? "bg-amber-500"
                : "bg-gradient-to-r from-cyan-600 to-violet-500"
          }`}
          style={{ width: unlimited ? (used > 0 ? "12%" : "0%") : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function promptDataLimitGb(): number | null {
  const raw = window.prompt("New data limit (GB). Use 0 for unlimited:", "100");
  if (raw === null) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    toast.error("Invalid GB value");
    return null;
  }
  return value;
}

export function ClientCommandTable({ rows }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const runAction = (
    username: string,
    key: string,
    fn: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
  ) => {
    setPendingKey(`${username}:${key}`);
    setOpenMenu(null);
    startTransition(async () => {
      const result = await fn();
      setPendingKey(null);
      if (!result.success) {
        toast.error("Action failed", {
          description:
            "error" in result ? result.error : "Marzban rejected the request.",
        });
        return;
      }
      toast.success(successMessage);
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    runAction(
      deleteTarget,
      "delete",
      () => deleteMarzbanUserAction(deleteTarget),
      "Shield terminated",
    );
    setDeleteTarget(null);
  };

  if (!rows.length) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <NocEmptyState
          title="No shields deployed yet"
          description="Provision a free VIP client or complete a checkout to populate this command grid."
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={menuRef}
        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md"
      >
        <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-white uppercase">
            <Shield className="h-4 w-4 text-cyan-400" />
            Client Command Grid
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Live Marzban fleet · {rows.length} shields on wire
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                <th className="px-5 py-3">🛡️ Shield ID</th>
                <th className="px-5 py-3">🚦 Status</th>
                <th className="px-5 py-3">📊 Bandwidth Burn</th>
                <th className="px-5 py-3">⏳ Expiry</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rows.map((user) => {
                const shieldStatus = resolveClientShieldStatus(user);
                const statusUi = STATUS_STYLES[shieldStatus];
                const rowBusy = pendingKey?.startsWith(`${user.username}:`);

                return (
                  <tr
                    key={user.username}
                    className="transition hover:bg-slate-900/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm font-bold text-white">
                        {user.username}
                      </p>
                      {user.telemetryDelayed ? (
                        <div className="mt-1">
                          <TelemetryDelayedBadge />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusUi.className}`}
                      >
                        {statusUi.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <BandwidthBar
                        used={user.used_traffic}
                        limit={user.data_limit}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-300">
                      {formatExpiryLabel(user.expire)}
                    </td>
                    <td className="relative px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={Boolean(rowBusy) && isPending}
                        onClick={() =>
                          setOpenMenu((prev) =>
                            prev === user.username ? null : user.username,
                          )
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-cyan-500/40 hover:text-white disabled:opacity-50"
                        aria-label={`Manage ${user.username}`}
                      >
                        {rowBusy && isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Settings2 className="h-4 w-4" />
                        )}
                      </button>

                      {openMenu === user.username ? (
                        <div className="absolute right-5 top-12 z-20 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
                          <p className="border-b border-slate-800 px-4 py-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            Manage
                          </p>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900"
                            onClick={() => {
                              startTransition(async () => {
                                setOpenMenu(null);
                                setPendingKey(`${user.username}:copy`);
                                const result = await copyMarzbanSubLinkAction(
                                  user.username,
                                );
                                setPendingKey(null);
                                if (!result.success || !result.data?.subLink) {
                                  toast.error("Copy failed", {
                                    description:
                                      "error" in result
                                        ? result.error
                                        : "No subscription link returned.",
                                  });
                                  return;
                                }
                                try {
                                  await navigator.clipboard.writeText(
                                    result.data.subLink,
                                  );
                                  toast.success("Subscription link copied");
                                } catch {
                                  toast.error("Clipboard blocked");
                                }
                              });
                            }}
                          >
                            <Copy className="h-3.5 w-3.5 text-cyan-400" />
                            🔗 Copy Sub Link
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900"
                            onClick={() => {
                              const gb = promptDataLimitGb();
                              if (gb === null) return;
                              runAction(
                                user.username,
                                "limit",
                                () =>
                                  adjustClientLimit(user.username, gb),
                                "Data limit updated",
                              );
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-cyan-400" />
                            Edit data limit (GB)
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900"
                            onClick={() =>
                              runAction(
                                user.username,
                                "reset",
                                () => processCryptoRenewal(user.username),
                                "Traffic reset · renewal synced",
                              )
                            }
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-violet-400" />
                            Reset usage
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900"
                            onClick={() =>
                              runAction(
                                user.username,
                                "suspend",
                                () =>
                                  toggleClientSuspension(user.username, true),
                                "Client suspended",
                              )
                            }
                          >
                            <Ban className="h-3.5 w-3.5 text-amber-400" />
                            Suspend
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-900"
                            onClick={() =>
                              runAction(
                                user.username,
                                "activate",
                                () =>
                                  toggleClientSuspension(user.username, false),
                                "Client activated",
                              )
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Activate
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 border-t border-slate-800 px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-950/30"
                            onClick={() => {
                              setOpenMenu(null);
                              setDeleteTarget(user.username);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            🗑️ Terminate (Delete)
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDestructiveDialog
        open={Boolean(deleteTarget)}
        onClose={() => !isPending && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Terminate Shield"
        description={`Permanently delete Marzban user "${deleteTarget ?? ""}"? This cannot be undone.`}
        confirmLabel="Terminate"
        pending={isPending}
      />
    </>
  );
}
