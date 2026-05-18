"use client";

import { AlertCircle } from "lucide-react";

import type { SystemConfigFlags } from "@/lib/system-config-types";

type Props = {
  config: SystemConfigFlags;
};

export function ConfigWarningBanner({ config }: Props) {
  if (config.isSupabaseConfigured && config.isMarzbanConfigured) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 px-5 py-4 text-sm font-medium text-amber-950 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div className="space-y-1">
          <p className="font-bold">Server configuration incomplete</p>
          <ul className="list-inside list-disc text-amber-900/90">
            {!config.isSupabaseConfigured ? (
              <li>
                Supabase admin is not configured on the server (check env in
                .env.local and restart <code className="font-mono text-xs">npm run dev</code>
                ).
              </li>
            ) : null}
            {!config.isMarzbanConfigured ? (
              <li>
                Marzban API is not fully configured (URL, username, and password
                required on the server).
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
