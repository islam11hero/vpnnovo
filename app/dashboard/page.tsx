"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Radar, ShieldAlert } from "lucide-react";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) {
      setError("Enter your Order ID to unlock the vault.");
      return;
    }
    setError(null);
    router.push(`/dashboard/${trimmed}`);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center">
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-10 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
            <Radar className="h-7 w-7 text-cyan-400" />
          </div>
          <p className="text-xs font-bold tracking-[0.25em] text-cyan-500/80 uppercase">
            OPSEC Security Vault
          </p>
          <h1 className="mt-2 font-poppins text-2xl font-bold tracking-tight text-white">
            Client Command Center
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Live diagnostics, zero-trace wipes, and untraceable VLESS keys — no
            email recovery vectors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="orderId"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300"
            >
              <KeyRound className="h-4 w-4 text-slate-500" />
              Secure Order ID (UUID)
            </label>
            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="123e4567-e89b-12d3-a456-426614174000"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 font-mono text-sm text-white transition-all placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {error ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-orange-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl border border-cyan-500/40 bg-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500"
          >
            Enter Security Vault
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-xs leading-relaxed font-medium text-slate-500">
            Your Order ID is your only login key. We never ask for email — built
            for privacy whales and media buyers running paid traffic.
          </p>
        </div>
      </div>
    </div>
  );
}
