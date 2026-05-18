"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Headphones, Loader2, MessageSquare, Shield } from "lucide-react";

import { TICKET_SUBJECTS, type SupportTicket } from "@/lib/tickets";

type Props = {
  orderId: string;
};

export function SupportPanel({ orderId }: Props) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>(TICKET_SUBJECTS[0]);
  const [message, setMessage] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tickets?order_id=${encodeURIComponent(orderId)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        success?: boolean;
        tickets?: SupportTicket[];
        error?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to load tickets");
      }
      setTickets(data.tickets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, subject, message }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to submit ticket");
      }
      setMessage("");
      setSuccess("Ticket submitted. Our team will reply here — no email required.");
      await loadTickets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

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
              100% Anonymous. No email needed. We only see your Order ID and
              technical context — never your real identity.
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

        {error ? (
          <p className="mb-3 text-sm font-bold text-red-600">{error}</p>
        ) : null}
        {success ? (
          <p className="mb-3 text-sm font-bold text-emerald-600">{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit Anonymous Ticket
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-[#3B82F6]" />
          <h3 className="font-poppins text-lg font-bold text-slate-900">
            Your Tickets
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">
            No tickets yet. Open one above if you need help.
          </p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-5"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">{ticket.subject}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      ticket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600">{ticket.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
                {ticket.admin_reply ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
                    <p className="mb-1 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                      Message from Admin
                    </p>
                    <p className="text-sm font-medium text-emerald-950">
                      {ticket.admin_reply}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
