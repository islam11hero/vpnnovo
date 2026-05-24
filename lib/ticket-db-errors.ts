/** Map Supabase errors to actionable messages for support tickets. */
export function formatTicketDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("tickets") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  ) {
    return (
      "Support system is not initialized. Run Supabase migration " +
      "20260529_support_tickets.sql (or RUN_ALL_PENDING.sql), then retry."
    );
  }
  return message;
}
