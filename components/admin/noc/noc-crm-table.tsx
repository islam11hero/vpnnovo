"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import type { AdminNodeRow } from "@/lib/admin-nodes";
import { formatBytes } from "@/lib/format-bytes";

export type NocCrmAction =
  | "instant_revoke"
  | "enforce_session"
  | "reset_usage"
  | "toggle_torrent"
  | "toggle_ads";

type Props = {
  nodes: AdminNodeRow[];
  searchQuery: string;
  processingKey: string | null;
  onAction: (orderId: string, action: NocCrmAction) => void;
  onRequestRevoke: (orderId: string) => void;
};

function usagePercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

export function NocCrmTable({
  nodes,
  searchQuery,
  processingKey,
  onAction,
  onRequestRevoke,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-4">
        <h2 className="text-sm font-bold tracking-wide text-white uppercase">
          Live Client Control
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Supabase orders × Marzban telemetry — anti-fraud actions
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              <th className="px-5 py-3">Username</th>
              <th className="px-5 py-3">Bandwidth Burn</th>
              <th className="px-5 py-3">Live Protocol</th>
              <th className="px-5 py-3">Session Status</th>
              <th className="px-5 py-3">Routing</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {nodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                  {searchQuery
                    ? `No clients match "${searchQuery}".`
                    : "No paid clients in Supabase — 0"}
                </td>
              </tr>
            ) : (
              nodes.map((node) => {
                const used = node.usedTraffic;
                const limit = node.dataLimit;
                const pct = usagePercent(used, limit);
                const highUsage = pct >= 90 && limit > 0;
                const rowBusy =
                  processingKey?.startsWith(`${node.orderId}:`) ?? false;
                const menuOpen = openMenuId === node.orderId;
                const revoked = node.orderStatus === "revoked";

                return (
                  <tr
                    key={node.orderId}
                    className="transition-colors hover:bg-slate-900/60"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-cyan-400">
                        {node.marzbanUsername ?? "—"}
                      </span>
                      <p className="mt-0.5 text-[10px] text-slate-600">
                        {node.planName}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="w-44">
                        <div className="mb-1 flex justify-between text-[10px] font-bold">
                          <span className={highUsage ? "text-red-400" : "text-slate-400"}>
                            {formatBytes(used)}
                          </span>
                          <span className="text-slate-600">
                            {limit > 0 ? formatBytes(limit) : "∞"}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              highUsage
                                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                : "bg-gradient-to-r from-cyan-500 to-blue-600"
                            }`}
                            style={{
                              width: `${limit > 0 ? pct : used > 0 ? 4 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-violet-300">
                        {node.liveProtocol}
                      </span>
                      <p className="mt-0.5 text-[10px] text-slate-600">
                        Ping: Live sync
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <SessionBadge status={node.sessionStatus} revoked={revoked} />
                      {node.onlinesLimit != null ? (
                        <p className="mt-1 text-[10px] text-slate-600">
                          Limit: {node.onlinesLimit} device
                          {node.onlinesLimit === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-2">
                        <RoutingSwitch
                          label="Block Torrent (P2P)"
                          checked={node.blockTorrent}
                          disabled={revoked}
                          onChange={() =>
                            onAction(node.orderId, "toggle_torrent")
                          }
                        />
                        <RoutingSwitch
                          label="Block Ads"
                          checked={node.blockAds}
                          disabled={revoked}
                          onChange={() => onAction(node.orderId, "toggle_ads")}
                        />
                      </div>
                    </td>
                    <td className="relative px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={rowBusy || revoked}
                        onClick={() =>
                          setOpenMenuId(menuOpen ? null : node.orderId)
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:border-slate-600 hover:text-white disabled:opacity-40"
                        aria-label="Actions"
                      >
                        {rowBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </button>
                      {menuOpen ? (
                        <div
                          ref={menuRef}
                          className="absolute right-5 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-2xl"
                        >
                          <button
                            type="button"
                            disabled={rowBusy}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                            onClick={() => {
                              setOpenMenuId(null);
                              onAction(node.orderId, "enforce_session");
                            }}
                          >
                            {processingKey === `${node.orderId}:enforce_session` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                            ) : (
                              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                            )}
                            Enforce Session Limit
                          </button>
                          <button
                            type="button"
                            disabled={rowBusy}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                            onClick={() => {
                              setOpenMenuId(null);
                              onAction(node.orderId, "reset_usage");
                            }}
                          >
                            {processingKey === `${node.orderId}:reset_usage` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            Reset Traffic
                          </button>
                          <button
                            type="button"
                            disabled={rowBusy}
                            className="flex w-full items-center gap-2 border-t border-slate-800 px-3 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-950/50 disabled:opacity-50"
                            onClick={() => {
                              setOpenMenuId(null);
                              onRequestRevoke(node.orderId);
                            }}
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Instant Revoke
                          </button>
                        </div>
                      ) : null}
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

function SessionBadge({
  status,
  revoked,
}: {
  status: string;
  revoked: boolean;
}) {
  if (revoked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
        Revoked
      </span>
    );
  }
  const active = status.toLowerCase().includes("active");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-slate-600 bg-slate-800 text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`}
      />
      {status}
    </span>
  );
}

function RoutingSwitch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-slate-400">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
          checked ? "bg-cyan-600" : "bg-slate-700"
        } disabled:opacity-40`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
      {label}
    </label>
  );
}
