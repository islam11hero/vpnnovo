"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { ExternalLink, Monitor, Smartphone, Zap } from "lucide-react";

import { CopyKeyButton } from "@/components/portal/CopyKeyButton";
import { buildV2boxDeepLink, buildV2rayNgDeepLink } from "@/lib/protocol-links";

type Props = {
  vpnSubLink: string;
};

export function ProtocolExportHub({ vpnSubLink }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 p-5 md:p-6">
        <motion.div className="mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">
            2026 Dual-Core Architecture
          </p>
        </motion.div>
        <p className="text-sm font-medium leading-relaxed text-zinc-400">
          One subscription link provisions{" "}
          <span className="font-bold text-white">both</span> stealth nodes on your
          panel. Import once — your client app downloads TCP Vision and XHTTP
          Split-Tunnel profiles automatically.
        </p>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 ring-1 ring-emerald-500/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              Mobile &amp; General Web
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-zinc-300">
            📱 Uses{" "}
            <span className="font-bold text-white">VLESS Vision TCP</span> for
            ultra-low latency on v2rayNG, V2Box, and mobile browsers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-violet-500/40 bg-violet-950/20 p-6 ring-1 ring-violet-500/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-violet-400" />
            <span className="text-xs font-bold tracking-wider text-violet-400 uppercase">
              Desktop &amp; AdsPower
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-zinc-300">
            💻 Uses{" "}
            <span className="font-bold text-white">VLESS XHTTP Split-Tunnel</span>{" "}
            to bypass advanced AI DPI on AdsPower, Dolphin, and automation stacks.
          </p>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-zinc-700/80 bg-gradient-to-br from-slate-950 to-zinc-900 p-6 text-center shadow-xl md:p-10">
        <p className="mb-2 text-xs font-bold tracking-widest text-emerald-400 uppercase">
          Universal import QR
        </p>
        <p className="mb-6 text-sm font-medium text-zinc-400">
          Scan to import your{" "}
          <span className="font-bold text-white">master subscription</span> — both
          Vision TCP and XHTTP nodes load into your app.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto inline-block rounded-2xl border border-zinc-700 bg-white p-6 shadow-lg shadow-emerald-500/10"
        >
          <QRCodeSVG value={vpnSubLink} size={220} level="M" includeMargin />
        </motion.div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={buildV2boxDeepLink(vpnSubLink)}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-emerald-500/50 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 text-emerald-400" />
          Open in V2Box (iOS)
        </a>
        <a
          href={buildV2rayNgDeepLink(vpnSubLink)}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-emerald-500/50 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 text-emerald-400" />
          Open in v2rayNG (Android)
        </a>
      </div>

      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6">
        <p className="mb-3 text-xs font-bold tracking-wider text-zinc-500 uppercase">
          Master subscription link
        </p>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
          <p className="break-all font-mono text-xs text-zinc-300">{vpnSubLink}</p>
        </div>
        <motion.div className="mt-4">
          <CopyKeyButton text={vpnSubLink} />
        </motion.div>
      </div>
    </motion.div>
  );
}
