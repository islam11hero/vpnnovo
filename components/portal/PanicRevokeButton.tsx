"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  orderId: string;
  disabled?: boolean;
  onRotated?: (newLink: string) => void;
};

export function PanicRevokeButton({ orderId, disabled, onRotated }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    const confirmed = window.confirm(
      "🚨 PANIC REVOKE\n\nThis instantly invalidates your current subscription link on all devices. A new link will be generated.\n\nAnyone with your old link (leaked configs, shared QR, etc.) will lose access.\n\nContinue?",
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/client/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        new_link?: string;
        error?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Revoke failed");
      }
      if (data.new_link && onRotated) {
        onRotated(data.new_link);
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revoke failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void handleRevoke()}
        disabled={disabled || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        🚨 Revoke &amp; Regenerate Credentials
      </button>
      {error ? (
        <p className="text-center text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
