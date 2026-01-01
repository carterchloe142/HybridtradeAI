create table if not exists por_audit (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references auth.users(id) on delete set null,
  published_at timestamp with time zone not null,
  coverage_pct numeric,
  reserve_usd numeric,
  aum_usd numeric,
  wallets_usd_total numeric,
  message text,
  hide_merkle_section boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists por_audit_published_at_idx on por_audit (published_at);

alter table por_audit enable row level security;
