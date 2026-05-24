import { Mail, MessageCircle } from "lucide-react";

import { getSupportConfig } from "@/lib/support-config";

export function SupportContactCard() {
  const { email, mailto, telegramUrl, telegramLabel } = getSupportConfig();

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-950/20 p-5">
      <p className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
        Direct contact
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Prefer tickets below for order-linked help. For urgent billing, use:
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={mailto}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:border-cyan-500/40 hover:text-cyan-100"
        >
          <Mail className="h-4 w-4 text-cyan-400" />
          {email}
        </a>
        {telegramUrl ? (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:border-cyan-500/40 hover:text-cyan-100"
          >
            <MessageCircle className="h-4 w-4 text-cyan-400" />
            Telegram {telegramLabel ?? ""}
          </a>
        ) : null}
      </div>
    </div>
  );
}
