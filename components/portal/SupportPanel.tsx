"use client";

import { FormEvent, useCallback, useEffect, useState, useTransition } from "react";
import { Headphones, Loader2, MessageSquare, Server, Shield } from "lucide-react";
import { toast } from "sonner";

import {
  createSupportTicket,
  getTicketsForOrder,
} from "@/actions/tickets";
import type { PortalOrderOption } from "@/lib/orders";
import { TICKET_SUBJECTS, type SupportTicket } from "@/lib/tickets";

type Props = {
  activeOrders: PortalOrderOption[];
  defaultOrderId: string;
};

export function SupportPanel({ activeOrders, defaultOrderId }: Props) {
  const [selectedOrderId, setSelectedOrderId] = useState(defaultOrderId);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>(TICKET_SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadTickets = useCallback(async (orderId: string) => {
    setLoading(true);
    const result = await getTicketsForOrder(orderId);
    if (!result.success) {
      toast.error(result.error);
      setTickets([]);
    } else {
      setTickets(result.data?.tickets ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTickets(selectedOrderId);
  }, [selectedOrderId, loadTickets]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedOrderId) {
      toast.error("Select an active VPN node before submitting.");
      return;
    }

    startTransition(async () => {
      const result = await createSupportTicket({
        order_id: selectedOrderId,
        subject,
        message,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Ticket submitted — our team will reply in this thread.");
      setMessage("");
      await loadTickets(selectedOrderId);
    });
  };

  const hasMultipleNodes = activeOrders.length > 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-950/60 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-bold text-white">
              Zero-Knowledge Support
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-400">
              No email required. Pick the VPN node you need help with — we only
              see your Order ID and technical context.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm md:p-8"
      >
        <div className="mb-5 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyan-400" />
          <h3 className="font-poppins text-lg font-bold text-white">
            Create New Ticket
          </h3>
        </div>

        <label className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
          <Server className="h-3.5 w-3.5" />
          Active VPN node (required)
        </label>
        {hasMultipleNodes ? (
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            required
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            {activeOrders.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-950/30 px-4 py-3 text-sm font-bold text-cyan-100">
            {activeOrders[0]?.label ?? defaultOrderId}
          </div>
        )}

        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          {TICKET_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          rows={5}
          placeholder="Describe your issue. Include app names (v2rayNG, AdsPower) if relevant."
          className="mb-4 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />

        <button
          type="submit"
          disabled={isPending || !selectedOrderId}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit Anonymous Ticket
        </button>
      </form>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-cyan-400" />
          <h3 className="font-poppins text-lg font-bold text-white">
            Your Tickets
          </h3>
          {hasMultipleNodes ? (
            <span className="ml-auto text-xs font-medium text-slate-500">
              Node: {selectedOrderId.slice(0, 8)}…
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">
            No tickets for this node yet. Open one above if you need help.
          </p>
        ) : (
          <ul className="space-y-6">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-white">{ticket.subject}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      ticket.status === "closed" || ticket.status === "resolved"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[92%] rounded-2xl rounded-br-md border border-slate-700 bg-slate-900 px-4 py-3 shadow-sm">
                      <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        You
                      </p>
                      <p className="text-sm font-medium text-slate-300">
                        {ticket.message}
                      </p>
                      <p className="mt-2 text-right text-[10px] text-slate-500">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {ticket.admin_reply ? (
                    <div className="flex justify-start">
                      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 shadow-sm">
                        <p className="mb-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                          NovaVPN Support
                        </p>
                        <p className="text-sm font-medium text-emerald-100">
                          {ticket.admin_reply}
                        </p>
                        {ticket.updated_at ? (
                          <p className="mt-2 text-[10px] text-emerald-500/80">
                            {new Date(ticket.updated_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs font-medium text-slate-500">
                      Awaiting engineer response…
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
