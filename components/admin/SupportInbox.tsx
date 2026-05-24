"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Headphones,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAllSupportTickets,
  getOpenSupportTicketCount,
  replyToSupportTicket,
} from "@/actions/tickets";
import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import { Sheet } from "@/components/ui/sheet";
import { ADMIN_ROUTES } from "@/lib/admin-access";
import { portalOrderUrl } from "@/lib/support-config";
import {
  isTicketAnswered,
  isTicketAwaitingReply,
  type SupportTicketWithOrder,
} from "@/lib/tickets";

type InboxFilter = "all" | "open" | "answered";

export function SupportInbox() {
  const [tickets, setTickets] = useState<SupportTicketWithOrder[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiOffline, setApiOffline] = useState(false);
  const [filter, setFilter] = useState<InboxFilter>("open");
  const [activeTicket, setActiveTicket] = useState<SupportTicketWithOrder | null>(
    null,
  );
  const [replyDraft, setReplyDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const [allResult, countResult] = await Promise.all([
      getAllSupportTickets(),
      getOpenSupportTicketCount(),
    ]);

    if (!allResult.success) {
      console.error("[support-inbox]", allResult.error);
      setApiOffline(true);
      setTickets([]);
      toast.error("Could not load tickets", { description: allResult.error });
    } else {
      setApiOffline(false);
      setTickets(allResult.data?.tickets ?? []);
    }

    if (countResult.success) {
      setOpenCount(countResult.data?.count ?? 0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTickets();
    const timer = setInterval(() => void loadTickets(), 30_000);
    return () => clearInterval(timer);
  }, [loadTickets]);

  const filtered = useMemo(() => {
    if (filter === "open") {
      return tickets.filter(isTicketAwaitingReply);
    }
    if (filter === "answered") {
      return tickets.filter(isTicketAnswered);
    }
    return tickets;
  }, [tickets, filter]);

  const openReply = (ticket: SupportTicketWithOrder) => {
    setActiveTicket(ticket);
    setReplyDraft(ticket.admin_reply ?? "");
  };

  const closeReply = () => {
    if (isPending) return;
    setActiveTicket(null);
    setReplyDraft("");
  };

  const copyOrderId = (orderId: string) => {
    void navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied");
  };

  const copyPortalLink = (orderId: string) => {
    void navigator.clipboard.writeText(portalOrderUrl(orderId));
    toast.success("Portal link copied");
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
        toast.error("Reply failed", { description: result.error });
        return;
      }

      toast.success("Reply sent", {
        description: "Client sees it in Portal → Support tab.",
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
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Support inbox</h2>
              <p className="text-xs text-slate-500">
                {openCount > 0
                  ? `${openCount} ticket${openCount === 1 ? "" : "s"} waiting for your reply`
                  : "All caught up — no open tickets"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {apiOffline ? <ApiOfflineBadge label="Supabase Offline" /> : null}
            <button
              type="button"
              onClick={() => void loadTickets()}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-cyan-500/40"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["open", `Open (${tickets.filter(isTicketAwaitingReply).length})`],
              ["answered", `Answered (${tickets.filter(isTicketAnswered).length})`],
              ["all", `All (${tickets.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filter === id
                  ? "bg-cyan-600 text-white"
                  : "border border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <NocEmptyState
            icon={MessageSquare}
            title={filter === "open" ? "No open tickets" : "No tickets in this view"}
            description={
              filter === "open"
                ? "When clients message you from Portal → Support, they appear here."
                : "Switch filter or wait for new client messages."
            }
          />
        ) : (
          <ul className="divide-y divide-slate-800">
            {filtered.map((ticket) => {
              const awaiting = isTicketAwaitingReply(ticket);
              const answered = isTicketAnswered(ticket);
              return (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{ticket.subject}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(ticket.created_at).toLocaleString()}
                      {ticket.plan_name ? ` · ${ticket.plan_name}` : ""}
                      {ticket.vpn_username ? ` · ${ticket.vpn_username}` : ""}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-cyan-400/80">
                      {ticket.order_id}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                      {ticket.message}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyOrderId(ticket.order_id)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                        Copy ID
                      </button>
                      <button
                        type="button"
                        onClick={() => copyPortalLink(ticket.order_id)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                        Portal link
                      </button>
                      <Link
                        href={`/portal/${ticket.order_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[10px] font-bold text-cyan-400 hover:bg-cyan-950/40"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open vault
                      </Link>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase ${
                        awaiting
                          ? "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : answered
                            ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border border-slate-600 bg-slate-800 text-slate-400"
                      }`}
                    >
                      {awaiting ? "open" : ticket.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openReply(ticket)}
                      className="rounded-lg border border-cyan-500/40 bg-cyan-600/20 px-4 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-600/30"
                    >
                      {answered ? "Edit reply" : "Reply"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-center text-[11px] text-slate-600">
          Also available from{" "}
          <Link href={ADMIN_ROUTES.overview} className="text-cyan-500 hover:underline">
            Command Center → Support Hub
          </Link>
        </p>
      </div>

      <Sheet
        open={Boolean(activeTicket)}
        onClose={closeReply}
        title={activeTicket?.subject ?? "Reply"}
        description={
          activeTicket
            ? `Order ${activeTicket.order_id.slice(0, 8)}… · ${activeTicket.vpn_username ?? "no Marzban user yet"}`
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
                Your reply (visible in client portal)
              </label>
              <textarea
                id="admin-reply"
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={8}
                disabled={isPending}
                placeholder="Installation steps, refund decision, proxy credentials, etc."
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
              Send reply to client
            </button>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
