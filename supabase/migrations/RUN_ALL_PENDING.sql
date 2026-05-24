-- =============================================================================
-- IPNOVA — Run once in Supabase SQL Editor (safe to re-run: IF NOT EXISTS)
-- Order matters. Paste entire file → Run.
-- =============================================================================

-- 1) Telemetry cache on orders
alter table public.orders
  add column if not exists used_traffic bigint not null default 0,
  add column if not exists data_limit bigint not null default 0,
  add column if not exists marzban_status text;

-- 2) Wallet + payment metadata
alter table public.orders
  add column if not exists wallet_balance_usd numeric not null default 0,
  add column if not exists payment_provider text,
  add column if not exists stripe_session_id text;

create index if not exists idx_orders_stripe_session_id on public.orders (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists idx_orders_status_created on public.orders (status, created_at desc);

-- 3) Trial anti-abuse
create table if not exists public.trial_logs (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  device_hash text not null,
  order_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_trial_logs_ip on public.trial_logs (ip_address);
create index if not exists idx_trial_logs_device on public.trial_logs (device_hash);
create index if not exists idx_trial_logs_created on public.trial_logs (created_at desc);

-- 4) Marzban handoff columns
alter table public.orders
  add column if not exists marzban_username text,
  add column if not exists vpn_sub_link text;

create index if not exists idx_orders_marzban_username
  on public.orders (marzban_username)
  where marzban_username is not null;

-- 5) Auth-linked orders
alter table public.orders
  add column if not exists user_id uuid;

create index if not exists idx_orders_user_id
  on public.orders (user_id)
  where user_id is not null;

-- 6) Proxy orders queue
create table if not exists public.proxy_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
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
  delivered_at timestamptz,
  vault_order_id uuid references public.orders (id) on delete set null
);

-- If proxy_orders existed with NOT NULL user_id from older script:
alter table public.proxy_orders
  alter column user_id drop not null;

alter table public.proxy_orders
  add column if not exists vault_order_id uuid references public.orders (id) on delete set null;

create index if not exists idx_proxy_orders_user on public.proxy_orders (user_id, created_at desc);
create index if not exists idx_proxy_orders_status on public.proxy_orders (status, created_at desc);
create index if not exists idx_proxy_orders_payment on public.proxy_orders (payment_order_id);
create index if not exists idx_proxy_orders_vault on public.proxy_orders (vault_order_id, created_at desc);

-- 7) Support tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open'
    check (status in ('open', 'closed', 'resolved', 'pending')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists idx_tickets_order_id on public.tickets (order_id, created_at desc);
create index if not exists idx_tickets_status on public.tickets (status, created_at desc);
