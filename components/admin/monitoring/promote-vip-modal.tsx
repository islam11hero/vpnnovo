"use client";

import { FormEvent, useState } from "react";
import { Loader2, Rocket, X } from "lucide-react";

import type { MonitoringBandwidthRow } from "@/lib/monitoring-types";

type Props = {
  open: boolean;
  onClose: () => void;
  consumers: MonitoringBandwidthRow[];
  onPromote: (username: string) => void;
  pending: boolean;
};

export function PromoteVipModal({
  open,
  onClose,
  consumers,
  onPromote,
  pending,
}: Props) {
  const [username, setUsername] = useState("");

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || pending) return;
    void onPromote(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !pending && onClose()}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => !pending && onClose()}
          className="absolute right-4 top-4 text-slate-500 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-violet-400" />
          <h3 className="font-poppins text-lg font-bold text-white">
            Promote to VIP Node
          </h3>
        </div>
        <p className="mb-4 text-sm text-slate-400">
          Assign a high-bandwidth user to a dedicated static routing profile on
          the fleet node.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="vip-user"
              className="mb-2 block text-xs font-bold text-slate-500 uppercase"
            >
              Marzban username
            </label>
            <select
              id="vip-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-sm text-white focus:border-violet-500/50 focus:outline-none"
            >
              <option value="">Select consumer…</option>
              {consumers.map((c) => (
                <option key={c.username} value={c.username}>
                  {c.username} ({c.usedGb.toFixed(2)} GB)
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={pending || !username}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Assign VIP Profile
          </button>
        </form>
      </div>
    </div>
  );
}
