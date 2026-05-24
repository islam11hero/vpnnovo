"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

type CryptoTopUpModalProps = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onGenerate: (amountUsd: number) => void;
  pending: boolean;
};

export function CryptoTopUpModal({
  open,
  onClose,
  orderId,
  onGenerate,
  pending,
}: CryptoTopUpModalProps) {
  const [amount, setAmount] = useState("25");

  if (!open) return null;

  const parsed = Number.parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed >= 5;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="topup-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
          NOWPayments
        </p>
        <h3 id="topup-title" className="mt-2 font-poppins text-xl font-bold text-white">
          Top Up Wallet
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Order ref: <span className="font-mono text-slate-400">{orderId.slice(0, 8)}…</span>
        </p>
        <label
          htmlFor="deposit-amount"
          className="mt-6 block text-xs font-bold tracking-wide text-slate-400 uppercase"
        >
          Amount to deposit (USD)
        </label>
        <input
          id="deposit-amount"
          type="number"
          min={5}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-lg font-bold text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <p className="mt-2 text-xs text-slate-600">Minimum $5.00 · Settles as USDT/BTC/ETH</p>
        <button
          type="button"
          disabled={!valid || pending}
          onClick={() => onGenerate(parsed)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Generate Crypto Invoice
        </button>
      </div>
    </div>
  );
}
