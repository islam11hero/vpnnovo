"use client";

import { useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  FileCode,
  Link2,
  Smartphone,
  Zap,
} from "lucide-react";

import { OpsecCard } from "@/components/portal/opsec/opsec-card";
import type { ProxyExtractSource } from "@/lib/marzban-proxy-extract";
import {
  buildClashYamlSnippet,
  buildRawVlessImportUri,
  buildSingboxYamlSnippet,
} from "@/lib/opsec-export";

type ExportId = "adspower" | "clash" | "vless" | "qr";

type Props = {
  vpnSubLink: string;
  vpnUsername: string;
  /** Live SOCKS5/HTTP line or subscription fallback from Marzban `links`. */
  adsPowerProxyLine: string;
  proxyProtocolLabel?: string;
  proxySource?: ProxyExtractSource;
};

const TABS: {
  id: ExportId;
  label: string;
  emoji: string;
  icon: typeof Copy;
}[] = [
  { id: "adspower", label: "AdsPower / Dolphin", emoji: "🦊", icon: Copy },
  { id: "clash", label: "Clash / Sing-box", emoji: "⚡", icon: FileCode },
  { id: "vless", label: "Raw VLESS URI", emoji: "🔗", icon: Link2 },
  { id: "qr", label: "Mobile QR", emoji: "📱", icon: Smartphone },
];

const SOURCE_HINT: Record<ProxyExtractSource, string> = {
  socks5: "Live SOCKS5 credentials from Marzban",
  http: "Live HTTP proxy credentials from Marzban",
  subscription: "Subscription URL — import in AdsPower as remote profile",
  synthetic: "Host template — verify port with your node admin",
};

export function SmartExportHub({
  vpnSubLink,
  vpnUsername,
  adsPowerProxyLine,
  proxyProtocolLabel = "Proxy",
  proxySource = "subscription",
}: Props) {
  const [active, setActive] = useState<ExportId>("adspower");
  const [copiedId, setCopiedId] = useState<ExportId | null>(null);

  const getPayload = useCallback(
    (id: ExportId): string => {
      switch (id) {
        case "adspower":
          return adsPowerProxyLine;
        case "clash":
          return vpnSubLink
            ? `${buildClashYamlSnippet(vpnSubLink)}\n\n${buildSingboxYamlSnippet(vpnSubLink)}`
            : "Subscription link required for Clash export.";
        case "vless":
          return vpnSubLink
            ? buildRawVlessImportUri(vpnSubLink)
            : adsPowerProxyLine;
        case "qr":
          return vpnSubLink || adsPowerProxyLine;
        default:
          return adsPowerProxyLine;
      }
    },
    [adsPowerProxyLine, vpnSubLink],
  );

  const handleCopy = async (id: ExportId) => {
    if (id === "qr") return;
    const text = getPayload(id);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Config Copied to Clipboard");
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      toast.error("Clipboard blocked", {
        description: "Allow clipboard access or copy manually.",
      });
    }
  };

  const preview = getPayload(active);
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <OpsecCard
      title="Smart Export Hub · 2026 Workflows"
      icon={Zap}
      accent="cyan"
      className="col-span-full"
    >
      <p className="mb-4 text-xs font-medium text-slate-500">
        {proxyProtocolLabel} · {SOURCE_HINT[proxySource]}
        {vpnUsername ? ` · ${vpnUsername}` : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const justCopied = copiedId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActive(tab.id);
                if (tab.id !== "qr") void handleCopy(tab.id);
              }}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                isActive
                  ? "border-cyan-500/50 bg-cyan-950/30 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-xs font-bold text-white">{tab.label}</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                {justCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : tab.id === "qr" ? (
                  "Show QR"
                ) : (
                  <>
                    <Icon className="h-3 w-3" />
                    1-Click Copy
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {active === "qr" ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="mb-4 text-xs font-bold tracking-widest text-cyan-500/80 uppercase">
            v2rayNG · Shadowrocket
          </p>
          <div className="rounded-2xl border border-slate-600 bg-white p-3 shadow-inner shadow-black/20">
            <QRCodeSVG value={preview} size={200} level="M" includeMargin />
          </div>
          <button
            type="button"
            onClick={() => void handleCopy("vless")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy mobile subscription URL
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            {activeTab.emoji} {activeTab.label} preview
          </p>
          <pre className="max-h-40 overflow-auto rounded-lg border border-slate-800 bg-black/50 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-cyan-100/90">
            {preview}
          </pre>
          <button
            type="button"
            onClick={() => void handleCopy(active)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-600/80 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 sm:w-auto sm:px-6"
          >
            {copiedId === active ? (
              <Check className="h-4 w-4 text-emerald-300" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy {activeTab.label}
          </button>
        </div>
      )}
    </OpsecCard>
  );
}
