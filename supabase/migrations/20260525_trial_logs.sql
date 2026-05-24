-- Anti-abuse trial vault (replaces Prisma SQLite TrialLog on Vercel)
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
