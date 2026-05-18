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

import { ProtocolExportHub } from "@/components/portal/ProtocolExportHub";
import { ExpiryCalendarButton } from "@/components/portal/ExpiryCalendarButton";
import { LiveNetworkStatus } from "@/components/portal/LiveNetworkStatus";
import { PanicRevokeButton } from "@/components/portal/PanicRevokeButton";
import { SupportPanel } from "@/components/portal/SupportPanel";
import { DownloadRecoveryKey } from "@/components/portal/DownloadRecoveryKey";
import { IntegrationGuides } from "@/components/portal/IntegrationGuides";
import { RenewSubscriptionButton } from "@/components/portal/RenewSubscriptionButton";
import { SecurityLab } from "@/components/portal/SecurityLab";
import type { MarzbanUserStats } from "@/lib/marzban";
import { formatTraffic } from "@/lib/marzban-users";
import {
  formatPortalCurrency,
  formatPortalExpiry,
  usagePercent,
} from "@/lib/portal-format";
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
};

const TABS: {
  id: TabId;
  label: string;
  icon: typeof BarChart3;
}[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
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
          isActive ? "text-[#3B82F6]" : "text-slate-400"
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
          ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {tab.label}
    </button>
  );
}

export function ClientDashboard({ order, marzbanUser }: Props) {
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
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-8 lg:block lg:rounded-l-2xl lg:border lg:border-r-0 lg:shadow-sm">
        <div className="mb-8 px-2">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Client Dashboard
          </p>
          <h1 className="mt-1 font-poppins text-lg font-bold text-slate-900">
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
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50 lg:rounded-r-2xl lg:border lg:border-l-0 lg:shadow-sm">
        {/* Mobile header */}
        <div className="border-b border-slate-200 bg-white px-5 py-5 lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wider text-emerald-600 uppercase">
                Shield active
              </p>
              <h1 className="font-poppins text-xl font-bold text-slate-900">
                {order.vpn_username ?? "Your Shield"}
              </h1>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-28 lg:p-8 lg:pb-8">
          {/* Desktop tab title */}
          <div className="mb-6 hidden lg:block">
            <h2 className="font-poppins text-2xl font-bold text-slate-900">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Live data synced from Marzban · Spanish egress
            </p>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-700 uppercase">
                        Shield provisioned
                      </p>
                      <p className="font-poppins text-xl font-bold text-slate-900">
                        {order.vpn_username ?? "Ready"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    Status: {statusLabel}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-[#3B82F6]" />
                  <h3 className="font-poppins text-lg font-bold text-slate-900">
                    Data usage
                  </h3>
                </div>
                {marzbanUser ? (
                  <>
                    <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                      <span>{formatTraffic(used)} used</span>
                      <span className="text-slate-400">
                        {limit > 0 ? formatTraffic(limit) : "Unlimited"}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#3B82F6] transition-all duration-500"
                        style={{
                          width: limit > 0 ? `${pct}%` : used > 0 ? "8%" : "0%",
                        }}
                      />
                    </div>
                    {expiryLabel ? (
                      <div className="mt-5">
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Calendar className="h-4 w-4 text-slate-400" />
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
                <ProtocolExportHub vpnSubLink={subLink} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Subscription link is still provisioning. Check back shortly.
                  </p>
                </div>
              )}

            </div>
          )}

          {activeTab === "developer" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600">
                  Integration guides for v2rayNG, AdsPower SOCKS5 routing, and
                  Python/Node scrapers. Import your subscription from the{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("connection")}
                    className="font-bold text-[#3B82F6] hover:underline"
                  >
                    Connection
                  </button>{" "}
                  tab first.
                </p>
              </div>
              <IntegrationGuides embedded />
            </div>
          )}

          {activeTab === "support" && <SupportPanel orderId={order.id} />}

          {activeTab === "security" && (
            <SecurityLab
              orderId={order.id}
              canRotate={Boolean(order.vpn_username && subLink)}
              onSubLinkRotated={setLiveSubLink}
            />
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 md:p-8">
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Plan
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {order.plan_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Amount paid
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900">
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

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-poppins text-lg font-bold text-slate-900">
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
                      <a href="/#pricing" className="font-bold text-[#3B82F6] hover:underline">
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
          className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white/95 px-2 py-1 backdrop-blur-lg lg:hidden"
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
