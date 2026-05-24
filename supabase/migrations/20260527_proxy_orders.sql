-- Manual proxy fulfillment queue (crypto-paid, admin-delivered)
create table if not exists public.proxy_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  payment_order_id uuid not null,
  product_id text not null,
  product_name text not null,
  proxy_type text not null,
  protocol text not null,
  quantity integer not null default 1 check (quantity > 0),
  duration_days integer not null default 30 check (duration_days > 0),
  geo_request text,
  amount_usd numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'delivered', 'cancelled', 'failed')),
  client_note text,
  delivery_payload text,
  admin_note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);

create index if not exists idx_proxy_orders_user on public.proxy_orders (user_id, created_at desc);
create index if not exists idx_proxy_orders_status on public.proxy_orders (status, created_at desc);
create index if not exists idx_proxy_orders_payment on public.proxy_orders (payment_order_id);

comment on table public.proxy_orders is 'Proxy IP orders — paid via orders table, credentials delivered manually by admin';
