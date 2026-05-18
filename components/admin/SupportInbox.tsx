"use client";

import { useCallback, useEffect, useState } from "react";
import { Headphones, Loader2, Send } from "lucide-react";

import type { SupportTicketWithOrder } from "@/lib/tickets";

export function SupportInbox() {
  const [tickets, setTickets] = useState<SupportTicketWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const data = (await res.json()) as {
        success?: boolean;
        tickets?: SupportTicketWithOrder[];
        error?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to load tickets");
      }
      setTickets(data.tickets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const handleReply = async (ticketId: string) => {
    const admin_reply = replyDrafts[ticketId]?.trim() ?? "";
    if (!admin_reply) return;

    setSubmittingId(ticketId);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId,
          admin_reply,
          status: "resolved",
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to send reply");
      }
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: "" }));
      await loadTickets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reply failed");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center rounded-3xl border border-slate-200/60 bg-white/90 py-24 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="border-b border-slate-200/60 bg-slate-50/80 p-6">
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-[#3B82F6]" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Support Inbox</h2>
              <p className="text-sm text-slate-500">
                Zero-knowledge tickets — technical context only, no client PII.
              </p>
            </div>
          </div>
        </div>

        {tickets.length === 0 ? (
          <p className="p-12 text-center text-sm font-medium text-slate-500">
            No support tickets yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{ticket.subject}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {new Date(ticket.created_at).toLocaleString()} · Order{" "}
                      <span className="font-mono">{ticket.order_id.slice(0, 8)}…</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      ticket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                    {ticket.vpn_username ?? "No VPN user"}
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                    {ticket.plan_name ?? "Unknown plan"}
                  </span>
                </div>

                <p className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  {ticket.message}
                </p>

                {ticket.admin_reply ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                    <p className="text-xs font-bold text-emerald-800 uppercase">
                      Your reply
                    </p>
                    <p className="mt-1 text-sm font-medium text-emerald-950">
                      {ticket.admin_reply}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={replyDrafts[ticket.id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Type your technical reply…"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-[#3B82F6]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                    <button
                      type="button"
                      disabled={submittingId === ticket.id}
                      onClick={() => void handleReply(ticket.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-600 disabled:opacity-60"
                    >
                      {submittingId === ticket.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send Reply &amp; Resolve
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
