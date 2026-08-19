-- Additive migration for citizen identity and profiles.
-- Apply only after reviewing the deployed schema and RLS in Supabase.
-- This file does not alter signalements, Storage, or existing admin roles.

create table if not exists public.profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  commune text,
  quartier text,
  address text,
  status text not null default 'active' check (status in ('active', 'blocked', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_commune_idx on public.profiles (commune);
create unique index if not exists profiles_phone_unique_idx
  on public.profiles (phone)
  where phone is not null;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_profiles_updated_at on public.profiles;
create trigger trg_set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Citizens read own profile" on public.profiles;
create policy "Citizens read own profile" on public.profiles
for select to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "Citizens insert own profile" on public.profiles;
create policy "Citizens insert own profile" on public.profiles
for insert to authenticated
with check (auth_user_id = auth.uid());

drop policy if exists "Citizens update own profile" on public.profiles;
create policy "Citizens update own profile" on public.profiles
for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists "Privileged users read profiles" on public.profiles;
create policy "Privileged users read profiles" on public.profiles
for select to authenticated
using (public.current_role() in ('agent', 'bourgmestre', 'gouverneur', 'admin', 'superadmin'));

-- Profile creation from auth.users is intentionally performed by the clients
-- after sign-up so email-confirmation behavior remains explicit and testable.
