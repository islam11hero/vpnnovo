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
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-bold text-slate-900">
              Zero-Knowledge Support
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-600">
              No email required. Pick the VPN node you need help with — we only
              see your Order ID and technical context.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-5 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="font-poppins text-lg font-bold text-slate-900">
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
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#3B82F6]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
          >
            {activeOrders.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm font-bold text-slate-800">
            {activeOrders[0]?.label ?? defaultOrderId}
          </div>
        )}

        <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#3B82F6]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
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
          className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#3B82F6]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
        />

        <button
          type="submit"
          disabled={isPending || !selectedOrderId}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit Anonymous Ticket
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="font-poppins text-lg font-bold text-slate-900">
            Your Tickets
          </h3>
          {hasMultipleNodes ? (
            <span className="ml-auto text-xs font-medium text-slate-400">
              Node: {selectedOrderId.slice(0, 8)}…
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
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
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">{ticket.subject}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      ticket.status === "closed" || ticket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[92%] rounded-2xl rounded-br-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
                      <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        You
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {ticket.message}
                      </p>
                      <p className="mt-2 text-right text-[10px] text-slate-400">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {ticket.admin_reply ? (
                    <div className="flex justify-start">
                      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 shadow-sm">
                        <p className="mb-1 text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                          NovaVPN Support
                        </p>
                        <p className="text-sm font-medium text-emerald-950">
                          {ticket.admin_reply}
                        </p>
                        {ticket.updated_at ? (
                          <p className="mt-2 text-[10px] text-emerald-600/80">
                            {new Date(ticket.updated_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs font-medium text-slate-400">
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
