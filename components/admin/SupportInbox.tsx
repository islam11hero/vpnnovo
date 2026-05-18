"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Headphones, Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import {
  getAllSupportTickets,
  replyToSupportTicket,
} from "@/actions/tickets";
import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import { Sheet } from "@/components/ui/sheet";
import type { SupportTicketWithOrder } from "@/lib/tickets";

export function SupportInbox() {
  const [tickets, setTickets] = useState<SupportTicketWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOffline, setApiOffline] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicketWithOrder | null>(
    null,
  );
  const [replyDraft, setReplyDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const result = await getAllSupportTickets();
    if (!result.success) {
      console.error("[support-inbox]", result.error);
      setApiOffline(true);
      setTickets([]);
      toast.error("API Offline", { description: result.error });
    } else {
      setApiOffline(false);
      setTickets(result.data?.tickets ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const openReply = (ticket: SupportTicketWithOrder) => {
    setActiveTicket(ticket);
    setReplyDraft(ticket.admin_reply ?? "");
  };

  const closeReply = () => {
    if (isPending) return;
    setActiveTicket(null);
    setReplyDraft("");
  };

  const submitReply = () => {
    if (!activeTicket) return;
    const admin_reply = replyDraft.trim();
    if (admin_reply.length < 3) {
      toast.error("Reply must be at least 3 characters.");
      return;
    }

    const ticketId = activeTicket.id;

    startTransition(async () => {
      const result = await replyToSupportTicket({
        ticket_id: ticketId,
        admin_reply,
      });

      if (!result.success) {
        toast.error("API Offline", { description: result.error });
        return;
      }

      toast.success("Reply delivered", {
        description: "Ticket closed · client portal updated.",
      });
      closeReply();
      await loadTickets();
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Support Hub</h2>
              <p className="text-xs text-slate-500">
                Supabase tickets · orders join
              </p>
            </div>
          </div>
          {apiOffline ? <ApiOfflineBadge label="Supabase Offline" /> : null}
        </div>

        {tickets.length === 0 ? (
          <NocEmptyState
            icon={MessageSquare}
            title="Awaiting First Deployment"
            description="Support tickets appear when clients open cases from the portal. Inbox is clear at pre-launch."
          />
        ) : (
          <ul className="divide-y divide-slate-800">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(ticket.created_at).toLocaleString()} ·{" "}
                    <span className="font-mono text-cyan-400/80">
                      {ticket.order_id}
                    </span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {ticket.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                      ticket.status === "closed" || ticket.status === "resolved"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {ticket.status}
                  </span>
                  {ticket.admin_reply ? (
                    <span className="text-[10px] font-medium text-slate-600">
                      Replied
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openReply(ticket)}
                      className="rounded-lg border border-cyan-500/40 bg-cyan-600/20 px-4 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-600/30"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        open={Boolean(activeTicket)}
        onClose={closeReply}
        title={activeTicket?.subject ?? "Reply"}
        description={
          activeTicket
            ? `Order ${activeTicket.order_id} · ${activeTicket.vpn_username ?? "—"}`
            : undefined
        }
      >
        {activeTicket ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Client message
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {activeTicket.message}
              </p>
            </div>
            <div>
              <label
                htmlFor="admin-reply"
                className="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
              >
                Admin reply
              </label>
              <textarea
                id="admin-reply"
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={8}
                disabled={isPending}
                placeholder="Technical resolution for the client portal…"
                className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={submitReply}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Reply &amp; Close Ticket
            </button>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
