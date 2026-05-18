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
      <div className="w-full rounded-[2rem] border border-slate-100 bg-white p-10 shadow-[0_24px_80px_-16px_rgba(15,23,42,0.12)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
            <ShieldCheck className="h-7 w-7 text-[#3B82F6]" />
          </div>
          <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-900">
            Client Portal
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Track payment status and retrieve your VPN credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="orderId"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"
            >
              <KeyRound className="h-4 w-4 text-slate-400" />
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
              className="w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5 font-mono text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#3B82F6]/50 focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {error ? (
              <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-[#3B82F6]"
          >
            Access My Account
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-left">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-xs leading-relaxed font-medium text-slate-500">
            We never ask for your email. Your Order ID is your only login key —
            like a Mullvad account number — for absolute privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
