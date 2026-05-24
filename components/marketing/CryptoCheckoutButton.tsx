"use client";

import { useState } from "react";
import { Bitcoin, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  tierType?: "b2c" | "proxy";
  tierId?: string;
  planName?: string;
  billing?: "monthly" | "annual" | "sovereign";
  className?: string;
  label?: string;
  children?: React.ReactNode;
};

export function CryptoCheckoutButton({
  tierType,
  tierId,
  planName,
  billing,
  className = "",
  label,
  children,
}: Props) {
  const [pending, setPending] = useState(false);

  const handleCheckout = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tierType && tierId ? { tierType, tierId } : { planName, billing }),
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        payment_url?: string;
        order_id?: string;
        error?: string;
      };

      if (!res.ok || !data.payment_url) {
        toast.error(data.error ?? "Could not start crypto checkout.");
        return;
      }

      toast.message("Redirecting to NOWPayments…", {
        description: "Pay with USDT, BTC, or ETH.",
      });
      window.location.href = data.payment_url;
    } catch {
      toast.error("Network error — try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void handleCheckout()}
      className={className}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <Bitcoin className="h-5 w-5 shrink-0" aria-hidden />
      )}
      {children ?? label ?? "Pay with Crypto"}
    </button>
  );
}
