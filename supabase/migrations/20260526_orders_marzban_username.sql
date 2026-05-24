-- Commercial handoff: align orders with Marzban username + subscription link columns.
alter table public.orders
  add column if not exists marzban_username text,
  add column if not exists vpn_sub_link text;

create index if not exists idx_orders_marzban_username
  on public.orders (marzban_username)
  where marzban_username is not null;

comment on column public.orders.marzban_username is 'Marzban panel username (canonical)';
comment on column public.orders.vpn_sub_link is 'Full subscription URL for client QR / import';
