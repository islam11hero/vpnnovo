-- Portal checkout: link proxy orders to VPN vault order (trial / guest portal)
alter table public.proxy_orders
  add column if not exists vault_order_id uuid references public.orders (id) on delete set null;

alter table public.proxy_orders
  alter column user_id drop not null;

create index if not exists idx_proxy_orders_vault
  on public.proxy_orders (vault_order_id, created_at desc);

comment on column public.proxy_orders.vault_order_id is
  'VPN/trial order UUID from portal — used when client orders without Supabase auth';
