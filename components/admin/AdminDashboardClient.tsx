"use client";

import { useCallback, useState, useTransition } from "react";
import {
  Headphones,
  LayoutGrid,
  Plus,
  Radar,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  enforceSessionLimitOrderNode,
  instantRevokeOrderNode,
  resetOrderUsage,
} from "@/actions/admin-orders";
import { useAdminSearch } from "@/components/admin/admin-search-context";
import { CreateVipDialog } from "@/components/admin/CreateVipDialog";
import { SupportInbox } from "@/components/admin/SupportInbox";
import { ConfirmDestructiveDialog } from "@/components/admin/noc/confirm-destructive-dialog";
import { useNocRefresh } from "@/components/admin/noc/noc-refresh-context";
import type { NocCrmAction } from "@/components/admin/noc/noc-crm-table";
import { InfrastructureOpsCard } from "@/components/admin/noc/infrastructure-ops-card";
import {
  ChartWidget,
  ClientsWidget,
  FinancialWidget,
  FleetWidget,
  HealthWidget,
} from "@/components/admin/noc/noc-widgets";

type AdminTab = "overview" | "crm" | "support" | "health";

const ADMIN_TABS: {
  id: AdminTab;
  label: string;
  icon: typeof Users;
}[] = [
  { id: "overview", label: "NOC Overview", icon: Radar },
  { id: "crm", label: "Client Control", icon: Users },
  { id: "support", label: "Support Hub", icon: Headphones },
  { id: "health", label: "System Health", icon: Settings },
];

export function AdminDashboardClient() {
  const { searchQuery } = useAdminSearch();
  const { refreshTelemetry } = useNocRefresh();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [vipDialogOpen, setVipDialogOpen] = useState(false);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [nukeOpen, setNukeOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const executeMutation = useCallback(
    (orderId: string, action: NocCrmAction) => {
      const key = `${orderId}:${action}`;
      setProcessingKey(key);

      startTransition(async () => {
        let result;
        if (action === "instant_revoke") {
          result = await instantRevokeOrderNode(orderId);
        } else if (action === "enforce_session") {
          result = await enforceSessionLimitOrderNode(orderId);
        } else if (action === "reset_usage") {
          result = await resetOrderUsage(orderId);
        } else {
          setProcessingKey(null);
          return;
        }

        if (!result.success) {
          toast.error("API Offline", { description: result.error });
        } else if (action === "instant_revoke") {
          toast.success("Node terminated", {
            description: "Marzban disabled · Supabase order revoked.",
          });
        } else if (action === "enforce_session") {
          toast.success("Session limit enforced", {
            description: "onlines_limit set to 1 device.",
          });
        } else {
          toast.success("Traffic reset", {
            description: "Marzban usage counter cleared.",
          });
        }

        await refreshTelemetry();
        setProcessingKey(null);
        setRevokeTarget(null);
      });
    },
    [refreshTelemetry],
  );

  const handleAction = (orderId: string, action: NocCrmAction) => {
    if (action === "toggle_torrent" || action === "toggle_ads") {
      toast.message("Routing preference saved", {
        description: "Xray core push — pending backend integration.",
      });
      return;
    }
    if (processingKey) return;
    executeMutation(orderId, action);
  };

  const confirmRevoke = () => {
    if (!revokeTarget || processingKey) return;
    executeMutation(revokeTarget, "instant_revoke");
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
            <LayoutGrid className="h-3 w-3" />
            Enterprise NOC
          </div>
          <h1 className="font-poppins text-3xl font-black tracking-tight text-white">
            Command Center
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Live Supabase · Marzban · Vultr — skeleton-masked latency · zero mock
            data
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVipDialogOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-2.5 text-sm font-bold text-cyan-100"
        >
          <Plus className="h-4 w-4" />
          Provision Free VIP Client
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-1.5">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <FinancialWidget />
          <FleetWidget onNukeClick={() => setNukeOpen(true)} />
          <ChartWidget />
          <HealthWidget showRefresh />
        </div>
      )}

      {activeTab === "crm" && (
        <ClientsWidget
          searchQuery={searchQuery}
          processingKey={processingKey}
          onAction={handleAction}
          onRequestRevoke={setRevokeTarget}
        />
      )}

      {activeTab === "support" && (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <SupportInbox />
        </div>
      )}

      {activeTab === "health" && (
        <div className="space-y-6">
          <HealthWidget showRefresh />
          <InfrastructureOpsCard />
        </div>
      )}

      <CreateVipDialog
        open={vipDialogOpen}
        onClose={() => setVipDialogOpen(false)}
        onCreated={() => void refreshTelemetry()}
      />

      <ConfirmDestructiveDialog
        open={Boolean(revokeTarget)}
        onClose={() => !isPending && setRevokeTarget(null)}
        onConfirm={confirmRevoke}
        title="Instant Revoke"
        description="This disables the Marzban user and marks the Supabase order as revoked. The client loses VPN access immediately."
        confirmLabel="Confirm Revoke"
        pending={isPending && Boolean(processingKey?.endsWith(":instant_revoke"))}
      />

      <ConfirmDestructiveDialog
        open={nukeOpen}
        onClose={() => setNukeOpen(false)}
        onConfirm={() => {
          setNukeOpen(false);
          toast.error("Fleet nuke locked", {
            description: "CEO must enable Auto-Vultr re-deploy in production.",
          });
        }}
        title="Nuke & Rebuild Fleet Node"
        description="This would destroy and re-provision your primary Vultr egress. All active sessions would drop."
        confirmLabel="Confirm Nuke"
        locked
        lockedMessage="Safety lock active — button enabled for UX review only. Confirm is disabled until CEO unlocks re-deploy."
      />
    </div>
  );
}
