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
      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-[#3B82F6]/40 hover:text-[#3B82F6]"
    >
      <CalendarPlus className="h-4 w-4" />
      📅 Add Expiry Alert to Calendar
    </button>
  );
}
