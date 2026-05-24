"use client";

import { CalendarPlus } from "lucide-react";

import { buildRenewalIcs, downloadIcsFile } from "@/lib/portal-calendar";

type Props = {
  expireUnix: number | null;
  orderId: string;
};

export function ExpiryCalendarButton({ expireUnix, orderId }: Props) {
  if (!expireUnix || expireUnix <= 0) return null;

  const handleDownload = () => {
    const ics = buildRenewalIcs(expireUnix, orderId);
    downloadIcsFile(ics, "ipnova-renewal-reminder.ics");
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400"
    >
      <CalendarPlus className="h-4 w-4" />
      📅 Add Expiry Alert to Calendar
    </button>
  );
}
