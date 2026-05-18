"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

type Props = {
  parentOrderId: string;
  planName: string;
  amount: number;
};

export function RenewSubscriptionButton({
  parentOrderId,
  planName,
  amount,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRenew = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: parentOrderId,
          planName,
          amount,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        payment_url?: string;
        error?: string;
      };
      if (!data.success || !data.payment_url) {
        throw new Error(data.error ?? "Renewal checkout failed");
      }
      window.location.href = data.payment_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Renewal failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleRenew}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {loading ? "Creating renewal invoice..." : "Renew Subscription"}
      </button>
      {error ? (
        <p className="text-center text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
