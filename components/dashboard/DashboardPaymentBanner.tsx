"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function DashboardPaymentBanner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment confirmed — your shield is active.");
    } else if (payment === "pending") {
      toast.message("Payment processing", {
        description: "Your vault will update once the payment clears.",
      });
    }
  }, [searchParams]);

  return null;
}
