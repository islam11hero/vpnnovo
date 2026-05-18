export type SupabaseOrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "underpaid";

export type SupabaseOrder = {
  id: string;
  plan_name: string;
  amount: number;
  status: SupabaseOrderStatus;
  vpn_username: string | null;
  vpn_sub_link: string | null;
  created_at: string;
  is_renewal?: boolean | null;
  target_username?: string | null;
  payment_currency?: string | null;
  tx_hash?: string | null;
};
