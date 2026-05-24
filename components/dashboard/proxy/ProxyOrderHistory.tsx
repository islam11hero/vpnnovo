"use client";

import { useState } from "react";
import { Check, Copy, Server } from "lucide-react";
import { toast } from "sonner";

import type { ProxyOrderRow, ProxyOrderStatus } from "@/lib/supabase/proxy-types";

const STATUS_STYLES: Record<
  ProxyOrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Awaiting payment",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  paid: {
    label: "Paid — provisioning",
    className: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  },
  processing: {
    label: "Processing",
    className: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  },
  delivered: {
    label: "Delivered",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-slate-600 bg-slate-800 text-slate-400",
  },
  failed: {
    label: "Failed",
    className: "border-red-500/40 bg-red-500/10 text-red-300",
  },
};

function OrderRow({ order }: { order: ProxyOrderRow }) {
  const [copied, setCopied] = useState(false);
  const status = STATUS_STYLES[order.status];

  const copyDelivery = async () => {
    if (!order.delivery_payload) return;
    try {
      await navigator.clipboard.writeText(order.delivery_payload);
      setCopied(true);
      toast.success("Proxy credentials copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-poppins text-sm font-bold text-white">
            {order.product_name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {order.quantity} × {order.protocol} · {order.duration_days} days
          </p>
          {order.client_note ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {order.client_note}
            </p>
          ) : null}
          <p className="mt-1 font-mono text-[10px] text-slate-600">
            {order.id.slice(0, 8)}… · ${Number(order.amount_usd).toFixed(2)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {order.status === "delivered" && order.delivery_payload ? (
        <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              Credentials
            </p>
            <button
              type="button"
              onClick={() => void copyDelivery()}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
          <pre className="max-h-40 overflow-auto rounded-lg border border-emerald-500/20 bg-slate-900 p-3 font-mono text-xs whitespace-pre-wrap text-slate-200">
            {order.delivery_payload}
          </pre>
        </div>
      ) : order.status === "paid" || order.status === "processing" ? (
        <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
          Payment confirmed — provisioning usually within 1–24 hours.
        </p>
      ) : null}
    </article>
  );
}

type Props = {
  orders: ProxyOrderRow[];
  onRefresh: () => void;
  refreshing: boolean;
};

export function ProxyOrderHistory({ orders, onRefresh, refreshing }: Props) {
  if (orders.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Server className="h-4 w-4 text-cyan-400" />
          Your orders
        </h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="text-xs font-bold text-cyan-400 hover:underline disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
