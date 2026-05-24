"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) {
      setError("Please enter your Order ID.");
      return;
    }
    setError(null);
    router.push(`/portal/${trimmed}`);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center">
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-10 shadow-xl shadow-black/30">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
            <ShieldCheck className="h-7 w-7 text-cyan-400" />
          </div>
          <h1 className="font-poppins text-2xl font-bold tracking-tight text-white">
            Client Portal
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Track payment status and retrieve your VPN credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="orderId"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300"
            >
              <KeyRound className="h-4 w-4 text-slate-500" />
              Enter your secure Order ID (UUID)
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 font-mono text-sm text-white transition-all placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              autoComplete="off"
              spellCheck={false}
            />
            {error ? (
              <p className="mt-2 text-sm font-medium text-red-400">{error}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40"
          >
            Access My Account
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-left">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-xs leading-relaxed font-medium text-slate-500">
            We never ask for your email. Your Order ID is your only login key —
            like a Mullvad account number — for absolute privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
