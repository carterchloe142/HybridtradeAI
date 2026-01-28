create table if not exists public.performance (
  id text primary key,
  week_ending timestamptz not null default now(),
  stream_rois jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists performance_week_ending_idx
  on public.performance (week_ending desc);

drop trigger if exists set_performance_updated_at on public.performance;
create trigger set_performance_updated_at
before update on public.performance
for each row
execute procedure public.set_updated_at();

alter table public.performance enable row level security;

drop policy if exists "Admins can read performance" on public.performance;
create policy "Admins can read performance"
on public.performance
for select
to authenticated
using (public.is_admin(auth.uid()));


create table if not exists public.investment_marks (
  id uuid primary key default gen_random_uuid(),
  investment_id text not null,
  user_id text not null,
  mark_date date not null,
  principal_usd numeric not null default 0,
  pnl_usd numeric not null default 0,
  equity_usd numeric not null default 0,
  reference jsonb not null default '{}'::jsonb,
  formula_version text not null default 'v1',
  created_at timestamptz not null default now()
);

create unique index if not exists investment_marks_unique_day
  on public.investment_marks (investment_id, mark_date);

create index if not exists investment_marks_user_date_idx
  on public.investment_marks (user_id, mark_date desc);

alter table public.investment_marks enable row level security;

drop policy if exists "Users can read own investment marks" on public.investment_marks;
create policy "Users can read own investment marks"
on public.investment_marks
for select
to authenticated
using (auth.uid()::text = user_id);

drop policy if exists "Admins can read all investment marks" on public.investment_marks;
create policy "Admins can read all investment marks"
on public.investment_marks
for select
to authenticated
using (public.is_admin(auth.uid()));

