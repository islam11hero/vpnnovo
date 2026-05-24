"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";

import { ProxyOrderHistory } from "@/components/dashboard/proxy/ProxyOrderHistory";
import { ProxyProductDetailView } from "@/components/dashboard/proxy/ProxyProductDetailView";
import { ProxyProductList } from "@/components/dashboard/proxy/ProxyProductList";
import { loadClientProxyOrdersAction } from "@/actions/proxy-orders";
import type { ProxyCategory } from "@/lib/proxy-catalog";
import type { ProxyOrderRow } from "@/lib/supabase/proxy-types";

type Props = {
  initialOrders: ProxyOrderRow[];
  userId: string | null;
  vaultOrderId: string;
};

export function ProxyServicesHub({
  initialOrders,
  userId,
  vaultOrderId,
}: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [category, setCategory] = useState<ProxyCategory | "all">("all");
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshOrders = () => {
    startTransition(async () => {
      const result = await loadClientProxyOrdersAction(vaultOrderId);
      if (result.success && result.data) {
        setOrders(result.data);
      }
    });
  };

  if (activeProductId) {
    return (
      <div className="space-y-8">
        <ProxyProductDetailView
          productId={activeProductId}
          vaultOrderId={vaultOrderId}
          onBack={() => setActiveProductId(null)}
        />
        <ProxyOrderHistory
          orders={orders}
          onRefresh={refreshOrders}
          refreshing={isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-slate-950 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <Globe className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-poppins text-lg font-bold text-white">
              Proxy IP catalog
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose a product to configure pricing tier, add-ons, and GEO — then
              pay with crypto. No pre-made bundles.
            </p>
            {!userId ? (
              <p className="mt-2 text-xs text-cyan-400/90">
                Checkout is tied to your vault Order ID.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ProxyProductList
        category={category}
        onCategoryChange={setCategory}
        onSelectProduct={setActiveProductId}
      />

      <ProxyOrderHistory
        orders={orders}
        onRefresh={refreshOrders}
        refreshing={isPending}
      />
    </div>
  );
}
