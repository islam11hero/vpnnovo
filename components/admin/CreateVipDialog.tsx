"use client";

import { FormEvent, useState } from "react";
import { Copy, Loader2, X } from "lucide-react";

import { CopyButton } from "@/components/CopyButton";

const PLAN_OPTIONS = [
  "VIP Manual",
  "Pro Shield",
  "Standard",
  "1 Month",
  "6 Months",
  "1 Year",
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateVipDialog({ open, onClose, onCreated }: Props) {
  const [planName, setPlanName] = useState("VIP Manual");
  const [months, setMonths] = useState(1);
  const [dataLimitGb, setDataLimitGb] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    order_id: string;
    vpn_username: string;
  } | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_name: planName,
          months,
          data_limit_gb: dataLimitGb,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        order_id?: string;
        vpn_username?: string;
        error?: string;
      };
      if (!res.ok || !data.success || !data.order_id) {
        throw new Error(data.error ?? "Provisioning failed");
      }
      setResult({
        order_id: data.order_id,
        vpn_username: data.vpn_username ?? "",
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Provisioning failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-slate-900">
            Create VIP / Manual User
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
              <p className="text-sm font-bold text-emerald-800">
                Shield provisioned. Give the client this Order ID for portal access:
              </p>
              <p className="mt-3 break-all font-mono text-sm font-bold text-slate-900">
                {result.order_id}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-600">
                Marzban user:{" "}
                <span className="font-mono font-bold">{result.vpn_username}</span>
              </p>
            </div>
            <CopyButton text={result.order_id} label="Copy Order ID" />
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-black"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                Plan name
              </label>
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Months
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                  Data limit (GB)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={dataLimitGb}
                  onChange={(e) => setDataLimitGb(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm font-bold text-red-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
              Provision instantly
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
