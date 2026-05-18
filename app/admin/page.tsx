"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  DollarSign,
  HardDrive,
  Headphones,
  Plus,
  Settings,
  Users,
} from "lucide-react";

import { useAdminSearch } from "@/components/admin/admin-search-context";
import { AdminKpiSkeleton } from "@/components/admin/admin-kpi-skeleton";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";
import { CommandGrid } from "@/components/admin/command-grid";
import { CreateVipDialog } from "@/components/admin/CreateVipDialog";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { SupportInbox } from "@/components/admin/SupportInbox";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";
import type { MarzbanAdminAction } from "@/lib/marzban";
import type { RevenueChartPoint } from "@/lib/revenue-chart";
import {
  formatTraffic,
  isActiveStatus,
  normalizeMarzbanUsers,
  type MarzbanUser,
} from "@/lib/marzban-users";

type UsersResponse = {
  success?: boolean;
  users?: unknown;
  error?: string;
};

type AdminTab = "crm" | "support" | "health";

const ADMIN_TABS: {
  id: AdminTab;
  label: string;
  icon: typeof Users;
}[] = [
  { id: "crm", label: "Clients CRM", icon: Users },
  { id: "support", label: "Support Inbox", icon: Headphones },
  { id: "health", label: "System Health", icon: Settings },
];

export default function AdminDashboard() {
  const { searchQuery } = useAdminSearch();
  const [activeTab, setActiveTab] = useState<AdminTab>("crm");
  const [vipDialogOpen, setVipDialogOpen] = useState(false);
  const [users, setUsers] = useState<MarzbanUser[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data: UsersResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load Marzban users");
      }
      setUsers(normalizeMarzbanUsers(data.users));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setUsers([]);
    }
  }, []);

  const loadRevenue = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/revenue", { cache: "no-store" });
      const data = (await res.json()) as {
        success?: boolean;
        chartData?: RevenueChartPoint[];
      };
      if (res.ok && data.chartData) {
        setRevenueChart(data.chartData);
      }
    } catch {
      setRevenueChart([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      await Promise.all([loadUsers(), loadRevenue()]);
      if (!cancelled) setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadUsers, loadRevenue]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const handleAction = async (
    username: string,
    action: MarzbanAdminAction,
  ) => {
    if (action === "delete") {
      const confirmed = window.confirm(
        `Permanently delete Marzban user "${username}"? This cannot be undone.`,
      );
      if (!confirmed) return;
    }

    const key = `${username}:${action}`;
    setProcessingUser(key);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/marzban-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, username }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Action failed");
      }
      await loadUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setProcessingUser(null);
    }
  };

  const metrics = useMemo(() => {
    const totalClients = users.length;
    const activeShields = users.filter((u) => isActiveStatus(u.status)).length;
    const networkBytes = users.reduce(
      (sum, u) => sum + (u.used_traffic ?? 0),
      0,
    );
    const weekRevenue = revenueChart.reduce((sum, d) => sum + d.revenue, 0);
    return {
      totalClients,
      activeShields,
      networkTraffic: formatTraffic(networkBytes),
      weekRevenue,
    };
  }, [users, revenueChart]);

  const kpiCards = [
    {
      title: "Total Clients",
      value: loading ? "—" : metrics.totalClients.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100/80",
    },
    {
      title: "Active Shields",
      value: loading ? "—" : metrics.activeShields.toLocaleString(),
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100/80",
    },
    {
      title: "Network Traffic",
      value: loading ? "—" : metrics.networkTraffic,
      icon: HardDrive,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100/80",
    },
    {
      title: "7-Day Revenue",
      value: loading
        ? "—"
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(metrics.weekRevenue),
      icon: DollarSign,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100/80",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Command Center"
        description="Enterprise CRM, zero-knowledge support, and live infrastructure control."
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/60 bg-white/90 p-2 shadow-sm backdrop-blur-sm">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#0F172A] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "crm" && (
        <>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setVipDialogOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Create VIP / Manual User
            </button>
          </div>

          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 text-sm font-medium text-red-700 shadow-sm backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          ) : null}

          {actionError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm font-medium text-amber-900 shadow-sm backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {actionError}
            </div>
          ) : null}

          {loading ? (
            <AdminKpiSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((stat) => (
                <div
                  key={stat.title}
                  className={`flex items-center justify-between rounded-2xl border bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md ${stat.border}`}
                >
                  <div>
                    <p className="mb-1 text-sm font-semibold text-slate-500">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-slate-800">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${stat.bg}`}
                  >
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-6 flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Revenue (Last 7 Days)
                </h2>
                <p className="text-sm text-slate-500">
                  Paid orders from Supabase — your source of truth
                </p>
              </div>
            </div>
            {loading ? (
              <div className="h-[300px] animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <RevenueChart
                data={revenueChart}
                empty={revenueChart.every((d) => d.revenue === 0)}
              />
            )}
          </div>

          {loading ? (
            <AdminTableSkeleton />
          ) : (
            <CommandGrid
              users={filteredUsers}
              allUsersCount={users.length}
              searchQuery={searchQuery}
              processingUser={processingUser}
              onAction={handleAction}
            />
          )}
        </>
      )}

      {activeTab === "support" && <SupportInbox />}

      {activeTab === "health" && <SystemHealthPanel />}

      <CreateVipDialog
        open={vipDialogOpen}
        onClose={() => setVipDialogOpen(false)}
        onCreated={() => void loadUsers()}
      />
    </div>
  );
}
