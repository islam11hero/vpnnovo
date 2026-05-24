"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Send, Package } from "lucide-react";
import { toast } from "sonner";

import {
  deliverProxyOrderAction,
  markProxyProcessingAction,
} from "@/actions/proxy-orders";
import type { ProxyOrderRow, ProxyOrderStatus } from "@/lib/supabase/proxy-types";

const STATUS_LABEL: Record<ProxyOrderStatus, string> = {
  pending: "Pending payment",
  paid: "Paid — deliver",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

type Props = {
  initialOrders: ProxyOrderRow[];
};

export function AdminProxyOrdersPanel({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [deliverTarget, setDeliverTarget] = useState<ProxyOrderRow | null>(null);
  const [deliveryPayload, setDeliveryPayload] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const queue = orders.filter(
    (o) => o.status === "paid" || o.status === "processing",
  );

  const submitDelivery = () => {
    if (!deliverTarget) return;
    startTransition(async () => {
      const result = await deliverProxyOrderAction({
        proxyOrderId: deliverTarget.id,
        deliveryPayload,
        adminNote,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Proxies delivered to client dashboard");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === deliverTarget.id
            ? {
                ...o,
                status: "delivered" as const,
                delivery_payload: deliveryPayload,
                admin_note: adminNote || null,
                delivered_at: new Date().toISOString(),
              }
            : o,
        ),
      );
      setDeliverTarget(null);
      setDeliveryPayload("");
      setAdminNote("");
    });
  };

  const markProcessing = (id: string) => {
    startTransition(async () => {
      const result = await markProxyProcessingAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: "processing" as const } : o,
        ),
      );
      toast.success("Marked as processing");
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 to-slate-950 p-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="font-poppins text-2xl font-bold text-white">
              Proxy fulfillment queue
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Paid crypto orders appear here — paste credentials and deliver to
              the client vault.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-amber-300">
          {queue.length} order{queue.length === 1 ? "" : "s"} awaiting delivery
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty / GEO</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Vault</th>
              <th className="px-4 py-3">Client note</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  No proxy orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-800/80 hover:bg-slate-900/40"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{order.product_name}</p>
                    <p className="text-xs text-slate-500">{order.protocol}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {order.quantity}
                    {order.geo_request ? (
                      <span className="block text-xs text-slate-500">
                        {order.geo_request}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-200">
                    ${Number(order.amount_usd).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-cyan-400">
                    {order.vault_order_id
                      ? `${order.vault_order_id.slice(0, 8)}…`
                      : "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-400">
                    {order.client_note || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "paid" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => markProcessing(order.id)}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
                        >
                          Processing
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            setDeliverTarget(order);
                            setDeliveryPayload("");
                            setAdminNote("");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          <Send className="h-3 w-3" />
                          Deliver
                        </button>
                      </div>
                    ) : order.status === "processing" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          setDeliverTarget(order);
                          setDeliveryPayload("");
                          setAdminNote("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        <Send className="h-3 w-3" />
                        Deliver
                      </button>
                    ) : order.status === "delivered" ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deliverTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70"
            onClick={() => !isPending && setDeliverTarget(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h3 className="font-poppins text-lg font-bold text-white">
              Deliver — {deliverTarget.product_name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Order {deliverTarget.id.slice(0, 8)}…
              {deliverTarget.vault_order_id
                ? ` · Vault ${deliverTarget.vault_order_id.slice(0, 8)}…`
                : deliverTarget.user_id
                  ? ` · User ${deliverTarget.user_id.slice(0, 8)}…`
                  : ""}
            </p>
            {deliverTarget.client_note ? (
              <p className="mt-3 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
                Client note: {deliverTarget.client_note}
              </p>
            ) : null}
            <label className="mt-4 block text-xs font-bold text-slate-500 uppercase">
              Proxy credentials (sent to client)
              <textarea
                value={deliveryPayload}
                onChange={(e) => setDeliveryPayload(e.target.value)}
                rows={8}
                placeholder={`host:port:user:pass\nsocks5://user:pass@ip:port\n...`}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-xs text-emerald-200"
              />
            </label>
            <label className="mt-3 block text-xs font-bold text-slate-500 uppercase">
              Admin note (optional)
              <input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              />
            </label>
            <button
              type="button"
              disabled={isPending || !deliveryPayload.trim()}
              onClick={submitDelivery}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-black text-white disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send to client dashboard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
