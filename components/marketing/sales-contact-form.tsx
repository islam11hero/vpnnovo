"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const BANDWIDTH_OPTIONS = ["1 TB / month", "10 TB / month", "Custom (100TB+)"] as const;

const USE_CASE_OPTIONS = [
  "Ad Verification",
  "Web Scraping / Data Collection",
  "Remote Access",
  "Brand Protection",
  "Other",
] as const;

export function SalesContactForm() {
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid corporate email.");
      setPending(false);
      return;
    }

    window.setTimeout(() => {
      setPending(false);
      form.reset();
      toast.success(
        "An enterprise account executive will contact you within 24 hours.",
        {
          description: "Thank you for your interest in IPNOVA Enterprise Infrastructure.",
        },
      );
    }, 600);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-bold tracking-wide text-slate-400 uppercase"
        >
          Corporate Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="company"
          className="mb-1.5 block text-xs font-bold tracking-wide text-slate-400 uppercase"
        >
          Company Name *
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          placeholder="Acme Global Ltd."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="bandwidth"
          className="mb-1.5 block text-xs font-bold tracking-wide text-slate-400 uppercase"
        >
          Monthly Bandwidth Needs *
        </label>
        <select
          id="bandwidth"
          name="bandwidth"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="" disabled>
            Select bandwidth tier
          </option>
          {BANDWIDTH_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="useCase"
          className="mb-1.5 block text-xs font-bold tracking-wide text-slate-400 uppercase"
        >
          Primary Use Case *
        </label>
        <select
          id="useCase"
          name="useCase"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="" disabled>
            Select use case
          </option>
          {USE_CASE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-xs font-bold tracking-wide text-slate-400 uppercase"
        >
          Additional Requirements
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="IP allocation, regions, compliance requirements…"
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-5 w-5" aria-hidden />
        )}
        Request Consultation
      </button>
    </form>
  );
}
