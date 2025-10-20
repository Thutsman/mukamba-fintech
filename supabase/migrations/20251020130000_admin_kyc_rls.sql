-- Admin-friendly RLS policies for KYC workflow
-- This migration creates a helper function is_admin() and
-- relaxes RLS for admins on relevant tables used by the app:
--   - kyc_verifications
--   - kyc_documents
--   - user_profiles (read-only for admin queries that enrich rows)

-- Helper: determine whether the current authenticated user is an admin.
-- Adjust the predicate to match your schema (boolean is_admin or role='admin').
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and (
        coalesce(up.is_admin, false) = true
        or coalesce(up.role, '') = 'admin'
      )
  );
$$;

comment on function public.is_admin() is 'Returns true when the current auth.uid() maps to an admin user in user_profiles.';

-- kyc_verifications: allow admins to view and update any row; users can still access their own.
drop policy if exists "Users can view own KYC verifications" on public.kyc_verifications;
create policy "Users can view own KYC verifications"
  on public.kyc_verifications
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own KYC verifications" on public.kyc_verifications;
create policy "Users can create own KYC verifications"
  on public.kyc_verifications
  for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own KYC verifications" on public.kyc_verifications;
create policy "Users can update own KYC verifications"
  on public.kyc_verifications
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- kyc_documents: allow admins to select documents for any verification.
-- Regular users may access only documents tied to their own verifications.
do $$ begin
  perform 1 from information_schema.tables where table_schema='public' and table_name='kyc_documents';
  if found then
    drop policy if exists "Users can view own kyc_documents" on public.kyc_documents;
    create policy "Users can view own kyc_documents"
      on public.kyc_documents
      for select
      to authenticated
      using (
        public.is_admin() or exists (
          select 1
          from public.kyc_verifications v
          where v.id = kyc_documents.verification_id
            and v.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- user_profiles: allow admins to select any profile (read-only),
-- users can always select their own profile.
drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Ownership note: if you have other policies (insert/update) they remain unchanged.


