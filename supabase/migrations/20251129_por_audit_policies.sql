-- Enable RLS (already enabled in table migration, kept for idempotence)
alter table if exists por_audit enable row level security;

-- Allow only admin users (per profiles table) to read audit entries via anon/auth token.
-- Service role bypasses RLS automatically for server APIs.
create policy if not exists "admins can select por_audit"
on por_audit for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.is_admin = true or lower(p.role) = 'admin')
  )
);

-- No write policies: only service role writes via server-side keys.
