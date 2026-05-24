"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { buildVipHandoffClipboardText } from "@/lib/vip-handoff";

export type ClientHandoffPanelProps = {
  accessCode: string;
  username: string;
  subLink: string;
  portalLink: string;
  message?: string;
  showCopyAll?: boolean;
};

function CopyField({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          {label}
        </p>
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!value}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-cyan-400 hover:bg-slate-800 disabled:opacity-40"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy
        </button>
      </div>
      {mono ? (
        <p className="break-all rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-xs text-slate-200">
          {value || "—"}
        </p>
      ) : (
        <input
          readOnly
          value={value}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-xs text-slate-200 focus:outline-none"
        />
      )}
    </div>
  );
}

export function ClientHandoffPanel({
  accessCode,
  username,
  subLink,
  portalLink,
  message = "Client handoff ready",
  showCopyAll = true,
}: ClientHandoffPanelProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const loginUrl = origin ? `${origin}/login?key=${accessCode}` : "";
  const qrValue = subLink.trim() || portalLink.trim();

  const copyAll = async () => {
    const text = buildVipHandoffClipboardText({
      accessCode,
      subLink: subLink || portalLink,
      username,
      origin: origin || "https://ipnova.app",
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      toast.success("Full handoff message copied");
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 p-6">
        <p className="text-center text-sm font-bold tracking-widest text-emerald-400 uppercase">
          {message}
        </p>
        <p className="mt-2 text-center font-mono text-lg font-bold text-white">
          {username}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            {subLink.trim() ? "Subscription QR" : "Portal QR"}
          </p>
          <div className="rounded-2xl border border-slate-700 bg-white p-4 shadow-lg">
            {qrValue ? (
              <QRCodeSVG value={qrValue} size={200} level="M" includeMargin />
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center text-xs text-slate-500">
                No link yet
              </div>
            )}
          </div>
          <p className="max-w-xs text-center text-[11px] text-slate-500">
            Scan in v2rayNG / sing-box, or send portal link if subscription is
            pending.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <CopyField label="Order ID / Access Code" value={accessCode} />
          <CopyField label="Direct subscription link" value={subLink} mono={false} />
          <CopyField label="Instant portal (no login)" value={portalLink} mono={false} />
          {loginUrl ? (
            <CopyField label="Magic login URL" value={loginUrl} mono={false} />
          ) : null}
        </div>
      </div>

      {showCopyAll ? (
        <button
          type="button"
          onClick={() => void copyAll()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-600 py-4 text-base font-black tracking-wide text-white uppercase shadow-lg shadow-emerald-900/30 hover:bg-emerald-500"
        >
          {copiedAll ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copiedAll ? "Copied!" : "Copy full handoff message"}
        </button>
      ) : null}
    </div>
  );
}
