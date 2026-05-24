-- Zero-knowledge support tickets (portal + admin inbox)
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

create index if not exists idx_tickets_order_id
  on public.tickets (order_id, created_at desc);

create index if not exists idx_tickets_status
  on public.tickets (status, created_at desc);

comment on table public.tickets is 'Client support threads keyed by VPN order_id';
