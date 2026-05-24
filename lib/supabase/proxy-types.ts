export type ProxyOrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "delivered"
  | "cancelled"
  | "failed";

export type ProxyOrderRow = {
  id: string;
  user_id: string | null;
  vault_order_id: string | null;
  payment_order_id: string;
  product_id: string;
  product_name: string;
  proxy_type: string;
  protocol: string;
  quantity: number;
  duration_days: number;
  geo_request: string | null;
  amount_usd: number;
  status: ProxyOrderStatus;
  client_note: string | null;
  delivery_payload: string | null;
  admin_note: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
};
