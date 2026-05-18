export type SupabaseOrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "underpaid"
  | "revoked";

export type SupabaseOrder = {
  id: string;
  user_id?: string | null;
  plan_name: string;
  amount: number;
  status: SupabaseOrderStatus;
  /** Legacy column — prefer `marzban_username` when present. */
  vpn_username: string | null;
  marzban_username?: string | null;
  vpn_sub_link: string | null;
  created_at: string;
  is_renewal?: boolean | null;
  target_username?: string | null;
  payment_currency?: string | null;
  tx_hash?: string | null;
};
