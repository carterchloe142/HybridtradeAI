create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.user_id = uid
      and (coalesce(p.is_admin, false) = true or lower(coalesce(p.role, '')) = 'admin')
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

create table if not exists public.kyc_applications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  level integer not null default 1,
  details jsonb not null default '{}'::jsonb,
  files jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kyc_applications_user_id_created_at_idx
  on public.kyc_applications (user_id, created_at desc);

create index if not exists kyc_applications_status_created_at_idx
  on public.kyc_applications (status, created_at desc);

drop trigger if exists set_kyc_applications_updated_at on public.kyc_applications;
create trigger set_kyc_applications_updated_at
before update on public.kyc_applications
for each row
execute procedure public.set_updated_at();

alter table public.kyc_applications enable row level security;

drop policy if exists "Users can insert own kyc" on public.kyc_applications;
create policy "Users can insert own kyc"
on public.kyc_applications
for insert
to authenticated
with check (auth.uid()::text = user_id);

drop policy if exists "Users can select own kyc" on public.kyc_applications;
create policy "Users can select own kyc"
on public.kyc_applications
for select
to authenticated
using (auth.uid()::text = user_id);

drop policy if exists "Admins can select all kyc" on public.kyc_applications;
create policy "Admins can select all kyc"
on public.kyc_applications
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can update kyc" on public.kyc_applications;
create policy "Admins can update kyc"
on public.kyc_applications
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

