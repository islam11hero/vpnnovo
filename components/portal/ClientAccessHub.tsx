"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, KeyRound, Link2 } from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/CopyButton";
import { resolveMagicLoginUrl } from "@/lib/vip-handoff";

type Props = {
  orderId: string;
  subLink: string;
  username: string;
};

function CopyRow({ label, value }: { label: string; value: string }) {
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          {label}
        </p>
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!value}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 disabled:opacity-40"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          Copy
        </button>
      </div>
      <p className="break-all font-mono text-xs text-slate-200">{value || "—"}</p>
    </div>
  );
}

export function ClientAccessHub({ orderId, subLink, username }: Props) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const magicLogin = origin ? resolveMagicLoginUrl(orderId, origin) : "";
  const qrValue = subLink.trim();

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 p-6 shadow-lg shadow-cyan-950/20 md:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
          <KeyRound className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-poppins text-lg font-bold text-white">
            Your access credentials
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Save your Order ID — it is your vault login. Scan the QR or copy the
            subscription link into v2rayNG / sing-box.
          </p>
          <p className="mt-2 font-mono text-xs text-slate-500">{username}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-4">
          <CopyRow label="Order ID / Login code" value={orderId} />
          <CopyRow label="Subscription link" value={subLink} />
          {magicLogin ? <CopyRow label="Magic login URL" value={magicLogin} /> : null}
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            {qrValue ? "Mobile QR" : "QR pending"}
          </p>
          <div className="rounded-2xl border border-slate-600 bg-white p-3 shadow-inner shadow-black/20">
            {qrValue ? (
              <QRCodeSVG value={qrValue} size={200} level="M" includeMargin />
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center px-4 text-center text-xs text-slate-500">
                Subscription link is syncing — refresh in a moment.
              </div>
            )}
          </div>
          <CopyButton
            text={subLink || orderId}
            label="Copy link or ID"
            className="w-full max-w-[232px]"
          />
        </div>
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        Import the subscription link in your VPN app, or scan the QR on mobile.
      </p>
    </div>
  );
}
