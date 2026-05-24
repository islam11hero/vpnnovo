"use client";

import { Download } from "lucide-react";

type Props = {
  orderId: string;
  vpnSubLink: string;
  vpnUsername?: string | null;
};

export function DownloadRecoveryKey({
  orderId,
  vpnSubLink,
  vpnUsername,
}: Props) {
  const handleDownload = () => {
    const content = [
      "IPNOVA — Recovery Key",
      "========================",
      "",
      "Keep this file offline. It is your only login credential (no email recovery).",
      "",
      `Order ID (Portal Login):`,
      orderId,
      "",
      `VPN Username: ${vpnUsername ?? "—"}`,
      "",
      `Subscription Link:`,
      vpnSubLink,
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "— IPNOVA Stealth Shield",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "IPNOVA-Recovery-Key.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 shadow-sm transition-all hover:border-cyan-500/40 hover:text-white"
    >
      <Download className="h-3.5 w-3.5" />
      Download Recovery Key
    </button>
  );
}
