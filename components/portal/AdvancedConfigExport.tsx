"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Smartphone } from "lucide-react";

type Props = {
  vpnSubLink: string;
};

function appendProfileParam(baseUrl: string, fps: string): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}fps=${fps}`;
}

export function AdvancedConfigExport({ vpnSubLink }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const v2boxUrl = `v2box://install-sub?url=${encodeURIComponent(vpnSubLink)}&name=IPNOVA`;
  const v2rayNgUrl = `v2rayng://install-sub?url=${encodeURIComponent(vpnSubLink)}&name=IPNOVA`;
  const singboxProfile = appendProfileParam(vpnSubLink, "sing-box");
  const clashProfile = appendProfileParam(vpnSubLink, "clash");

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <h3 className="font-poppins text-lg font-bold text-slate-900">
        Advanced Client Profiles &amp; Auto-Import
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Power-user shortcuts — no manual paste required on mobile.
      </p>

      <div className="mt-6">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
          <Smartphone className="h-4 w-4" />
          1-Click Auto-Import
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={v2boxUrl}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:border-[#3B82F6]/40 hover:bg-blue-50/80"
          >
            <ExternalLink className="h-4 w-4 text-[#3B82F6]" />
            iOS V2Box
          </a>
          <a
            href={v2rayNgUrl}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:border-[#3B82F6]/40 hover:bg-blue-50/80"
          >
            <ExternalLink className="h-4 w-4 text-[#3B82F6]" />
            Android v2rayNG
          </a>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
          PC power users (Sing-box / Clash Meta)
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void copyText(singboxProfile, "singbox")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {copiedKey === "singbox" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Sing-box Profile
          </button>
          <button
            type="button"
            onClick={() => void copyText(clashProfile, "clash")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {copiedKey === "clash" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Clash Meta Profile
          </button>
        </div>
      </div>
    </div>
  );
}
