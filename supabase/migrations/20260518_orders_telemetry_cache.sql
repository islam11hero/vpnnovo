-- IPNOVA: cache Marzban telemetry on orders for resilient dashboard UI.
-- Run in Supabase SQL Editor if columns are missing.

alter table public.orders
  add column if not exists used_traffic bigint not null default 0,
  add column if not exists data_limit bigint not null default 0,
  add column if not exists marzban_status text;

comment on column public.orders.used_traffic is 'Last known Marzban used_traffic bytes (cache)';
comment on column public.orders.data_limit is 'Last known Marzban data_limit bytes (cache)';
comment on column public.orders.marzban_status is 'Last known Marzban user status: active, disabled, limited';
