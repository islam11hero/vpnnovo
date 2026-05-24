export type TicketStatus = "open" | "closed" | "resolved" | "pending";

export type SupportTicket = {
  id: string;
  order_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  admin_reply: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type SupportTicketWithOrder = SupportTicket & {
  vpn_username: string | null;
  plan_name: string | null;
};

export const TICKET_SUBJECTS = [
  "Connection Issues",
  "Speed / Latency",
  "Billing Question",
  "Proxy delivery / credentials",
  "Technical Integration",
  "Account Access",
  "Other",
] as const;

export function isTicketAwaitingReply(ticket: Pick<SupportTicket, "status" | "admin_reply">): boolean {
  return !ticket.admin_reply && (ticket.status === "open" || ticket.status === "pending");
}

export function isTicketAnswered(ticket: Pick<SupportTicket, "admin_reply">): boolean {
  return Boolean(ticket.admin_reply?.trim());
}
