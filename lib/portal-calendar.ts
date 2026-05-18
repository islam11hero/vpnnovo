function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Build .ics content for a renewal reminder 48h before VPN expiry. */
export function buildRenewalIcs(expireUnix: number, orderId?: string): string {
  const expireDate = new Date(expireUnix * 1000);
  const alertDate = new Date(expireDate.getTime() - 48 * 60 * 60 * 1000);
  const now = new Date();
  const uid = `ipnova-renew-${orderId ?? "shield"}@ipnova.app`;

  const description = [
    "Your secure VPN expires in 48 hours.",
    "Go to IPNOVA to renew using your Order ID to avoid disconnection.",
    orderId ? `Order ID: ${orderId}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IPNOVA//VPN Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(now)}`,
    `DTSTART:${formatIcsUtc(alertDate)}`,
    `DTEND:${formatIcsUtc(expireDate)}`,
    "SUMMARY:⚠️ Renew IPNOVA VPN",
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Renew IPNOVA VPN",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
