-- Link Supabase Auth users to paid VPN orders (dashboard + link-order)
alter table public.orders
  add column if not exists user_id uuid;

create index if not exists idx_orders_user_id
  on public.orders (user_id)
  where user_id is not null;

comment on column public.orders.user_id is 'Supabase auth.users id when client links order to account';
