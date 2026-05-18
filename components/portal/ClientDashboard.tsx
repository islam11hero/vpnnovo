"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Code2,
  CreditCard,
  HardDrive,
  Headphones,
  KeyRound,
  Shield,
  ShieldCheck,
} from "lucide-react";

import { ExpiryCalendarButton } from "@/components/portal/ExpiryCalendarButton";
import { LiveNetworkStatus } from "@/components/portal/LiveNetworkStatus";
import { PanicRevokeButton } from "@/components/portal/PanicRevokeButton";
import { SupportPanel } from "@/components/portal/SupportPanel";
import { DownloadRecoveryKey } from "@/components/portal/DownloadRecoveryKey";
import { IntegrationGuides } from "@/components/portal/IntegrationGuides";
import { RenewSubscriptionButton } from "@/components/portal/RenewSubscriptionButton";
import { SecurityLab } from "@/components/portal/SecurityLab";
import { DeepFingerprintAuditor } from "@/components/portal/opsec/DeepFingerprintAuditor";
import { DNSAndIPv6Auditor } from "@/components/portal/opsec/DNSAndIPv6Auditor";
import { IPTrustScanner } from "@/components/portal/opsec/IPTrustScanner";
import { SmartExportHub } from "@/components/portal/opsec/SmartExportHub";
import { TimezoneAuditor } from "@/components/portal/opsec/TimezoneAuditor";
import { WebRTCLeakShield } from "@/components/portal/opsec/WebRTCLeakShield";
import { ZeroTraceWipeButton } from "@/components/portal/opsec/ZeroTraceWipeButton";
import type { MarzbanUserStats } from "@/lib/marzban-types";
import { formatTraffic } from "@/lib/marzban-users";
import {
  formatPortalCurrency,
  formatPortalExpiry,
  usagePercent,
} from "@/lib/portal-format";
import type { PortalOrderOption } from "@/lib/orders";
import type { SupabaseOrder } from "@/lib/supabase/types";

type TabId =
  | "overview"
  | "connection"
  | "developer"
  | "billing"
  | "support"
  | "security";

type Props = {
  order: SupabaseOrder;
  marzbanUser: MarzbanUserStats | null;
  activeOrders: PortalOrderOption[];
};

const TABS: {
  id: TabId;
  label: string;
  icon: typeof BarChart3;
}[] = [
  { id: "overview", label: "OPSEC Vault", icon: Shield },
  { id: "connection", label: "Connection", icon: KeyRound },
  { id: "developer", label: "Developer Hub", icon: Code2 },
  { id: "billing", label: "Billing & Security", icon: ShieldCheck },
  { id: "support", label: "Support & Help", icon: Headphones },
  { id: "security", label: "Security Lab", icon: Shield },
];

function NavButton({
  tab,
  activeTab,
  onSelect,
  layout,
}: {
  tab: (typeof TABS)[number];
  activeTab: TabId;
  onSelect: (id: TabId) => void;
  layout: "sidebar" | "bottom";
}) {
  const Icon = tab.icon;
  const isActive = activeTab === tab.id;

  if (layout === "bottom") {
    return (
      <button
        type="button"
        onClick={() => onSelect(tab.id)}
        className={`flex flex-1 flex-col items-center gap-1 px-1 py-2 transition-colors ${
          isActive ? "text-cyan-400" : "text-slate-500"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
        <span className="max-w-[4.5rem] truncate text-[10px] font-bold leading-tight">
          {tab.label.split(" ")[0]}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(tab.id)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
        isActive
          ? "bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-lg shadow-cyan-500/20"
          : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {tab.label}
    </button>
  );
}

export function ClientDashboard({ order, marzbanUser, activeOrders }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [liveSubLink, setLiveSubLink] = useState(order.vpn_sub_link ?? "");

  useEffect(() => {
    setLiveSubLink(order.vpn_sub_link ?? "");
  }, [order.vpn_sub_link]);

  const subLink = liveSubLink;
  const isTrial =
    order.plan_name === "24-Hour Stealth Trial" ||
    order.plan_name === "2-Hour Stealth Trial" ||
    Number(order.amount) === 0;
  const used = marzbanUser?.used_traffic ?? 0;
  const limit = marzbanUser?.data_limit ?? 0;
  const pct = usagePercent(used, limit);
  const expiryLabel = formatPortalExpiry(marzbanUser?.expire ?? null);
  const statusLabel =
    marzbanUser?.status?.toLowerCase() === "disabled" ? "Disabled" : "Active";
  const isActive = statusLabel === "Active";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950/90 px-4 py-8 lg:block lg:rounded-l-2xl lg:border lg:border-r-0">
        <div className="mb-8 px-2">
          <p className="text-xs font-bold tracking-[0.2em] text-cyan-500/80 uppercase">
            OPSEC Security Vault
          </p>
          <h1 className="mt-1 font-poppins text-lg font-bold text-white">
            {order.vpn_username ?? "Your Shield"}
          </h1>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">
            {order.plan_name}
          </p>
        </div>
        <nav className="space-y-1" aria-label="Dashboard navigation">
          {TABS.map((tab) => (
            <NavButton
              key={tab.id}
              tab={tab}
              activeTab={activeTab}
              onSelect={setActiveTab}
              layout="sidebar"
            />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-950 lg:rounded-r-2xl lg:border lg:border-l-0 lg:border-slate-800">
        {/* Mobile header */}
        <div className="border-b border-slate-800 bg-slate-950/95 px-5 py-5 lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-cyan-500 uppercase">
                OPSEC Vault
              </p>
              <h1 className="font-poppins text-xl font-bold text-white">
                {order.vpn_username ?? "Your Shield"}
              </h1>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                isActive
                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border border-slate-700 bg-slate-800 text-slate-400"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-28 lg:p-8 lg:pb-8">
          {/* Desktop tab title */}
          <div className="mb-6 hidden lg:block">
            <h2 className="font-poppins text-2xl font-bold text-white">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Live Marzban telemetry · Privacy Whale OPSEC layer
            </p>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <TimezoneAuditor />
                <WebRTCLeakShield />
                <IPTrustScanner />
                <DNSAndIPv6Auditor />
                <DeepFingerprintAuditor />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-400 uppercase">
                        Active subscription
                      </p>
                      <p className="font-poppins text-xl font-bold text-white">
                        {order.vpn_username ?? "Ready"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                      isActive
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border border-slate-700 bg-slate-800 text-slate-400"
                    }`}
                  >
                    Status: {statusLabel}
                  </span>
                </div>
                <div className="mt-6">
                  <ZeroTraceWipeButton
                    orderId={order.id}
                    disabled={!order.vpn_username || !subLink}
                    onWiped={setLiveSubLink}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md md:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-poppins text-lg font-bold text-white">
                    Data usage
                  </h3>
                </div>
                {marzbanUser ? (
                  <>
                    <div className="mb-2 flex justify-between text-sm font-bold text-slate-300">
                      <span>{formatTraffic(used)} used</span>
                      <span className="text-slate-500">
                        {limit > 0 ? formatTraffic(limit) : "Unlimited"}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{
                          width: limit > 0 ? `${pct}%` : used > 0 ? "8%" : "0%",
                        }}
                      />
                    </div>
                    {expiryLabel ? (
                      <div className="mt-5">
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-400">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          Expires {expiryLabel}
                        </p>
                        <ExpiryCalendarButton
                          expireUnix={marzbanUser.expire ?? null}
                          orderId={order.id}
                        />
                      </div>
                    ) : (
                      <p className="mt-5 text-sm font-medium text-slate-500">
                        No expiration set
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium text-slate-500">
                    Usage stats are syncing. Refresh in a moment.
                  </p>
                )}
              </div>

              <LiveNetworkStatus />
            </div>
          )}

          {activeTab === "connection" && (
            <div className="space-y-6">
              {subLink ? (
                <SmartExportHub
                  vpnSubLink={subLink}
                  vpnUsername={order.vpn_username ?? order.marzban_username ?? ""}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center backdrop-blur-md">
                  <p className="text-sm font-medium text-slate-500">
                    Subscription link is still provisioning. Check back shortly.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "developer" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md">
                <p className="text-sm font-medium text-slate-600">
                  Integration guides for v2rayNG, AdsPower SOCKS5 routing, and
                  Python/Node scrapers. Import your subscription from the{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("connection")}
                    className="font-bold text-cyan-400 hover:underline"
                  >
                    Connection
                  </button>{" "}
                  tab first.
                </p>
              </div>
              <IntegrationGuides embedded />
            </div>
          )}

          {activeTab === "support" && (
            <SupportPanel
              activeOrders={activeOrders}
              defaultOrderId={order.id}
            />
          )}

          {activeTab === "security" && (
            <SecurityLab
              orderId={order.id}
              canRotate={Boolean(order.vpn_username && subLink)}
              onSubLinkRotated={setLiveSubLink}
            />
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md sm:grid-cols-2 md:p-8">
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Plan
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {order.plan_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Amount paid
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-lg font-bold text-white">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    {isTrial ? "Free trial" : formatPortalCurrency(Number(order.amount))}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Order ID
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
                    {order.id}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Your only portal login credential — store it securely.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md">
                <h3 className="mb-4 font-poppins text-lg font-bold text-white">
                  Account actions
                </h3>
                <div className="flex flex-col gap-4">
                  <DownloadRecoveryKey
                    orderId={order.id}
                    vpnSubLink={subLink}
                    vpnUsername={order.vpn_username}
                  />
                  {!isTrial ? (
                    <RenewSubscriptionButton
                      parentOrderId={order.id}
                      planName={order.plan_name}
                    />
                  ) : (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                      Trial accounts cannot renew in-app. Upgrade from{" "}
                      <a href="/#pricing" className="font-bold text-cyan-400 hover:underline">
                        pricing
                      </a>{" "}
                      when ready.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-red-200/80 bg-red-50/50 p-6 shadow-sm backdrop-blur-sm md:p-8">
                <h3 className="mb-2 font-poppins text-lg font-bold text-red-900">
                  Danger Zone
                </h3>
                <p className="mb-4 text-sm font-medium text-red-800/90">
                  Suspect a leaked config or compromised subscription URL? Revoke
                  instantly — all old links die, and a fresh key is issued.
                </p>
                <PanicRevokeButton
                  orderId={order.id}
                  disabled={!order.vpn_username || !subLink}
                  onRotated={setLiveSubLink}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-800 bg-slate-950/95 px-2 py-1 backdrop-blur-lg lg:hidden"
          aria-label="Dashboard navigation"
        >
          {TABS.map((tab) => (
            <NavButton
              key={tab.id}
              tab={tab}
              activeTab={activeTab}
              onSelect={setActiveTab}
              layout="bottom"
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
