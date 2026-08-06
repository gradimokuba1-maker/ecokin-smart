create extension if not exists pgcrypto;

create table if not exists public.signalements (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author text not null,
  author_id text,
  author_role text,
  province text,
  city text,
  commune text not null,
  quartier text,
  zone text,
  category text not null,
  urgency text not null check (urgency in ('faible', 'moyen', 'eleve', 'critique')),
  description text,
  lat double precision,
  lng double precision,
  address text,
  volume_m3 double precision,
  priority_score double precision,
  ack boolean not null default false,
  ack_by text,
  ack_at timestamptz,
  team text,
  status text not null default 'en_attente' check (status in ('en_attente', 'assignee', 'en_cours', 'terminee', 'rejete')),
  history jsonb not null default '[]'::jsonb,
  photo_before text,
  photo_after text,
  photo_url text,
  image_hash text,
  ai_analysis jsonb,
  weight_kg double precision,
  weight_tons double precision,
  green_points_awarded integer,
  active boolean not null default true,
  deleted_at timestamptz,
  deleted_by text,
  archived_at timestamptz,
  assigned_agent_id text,
  assigned_agent_name text
);

create index if not exists signalements_created_at_idx on public.signalements (created_at desc);
create index if not exists signalements_commune_idx on public.signalements (commune);
create index if not exists signalements_status_idx on public.signalements (status);
create index if not exists signalements_author_id_idx on public.signalements (author_id);

create or replace function public.set_signalements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_signalements_updated_at on public.signalements;
create trigger trg_set_signalements_updated_at
before update on public.signalements
for each row
execute function public.set_signalements_updated_at();

alter table public.signalements enable row level security;

-- Roles considered privileged in the platform
-- Possible values in JWT: 'citoyen', 'agent', 'bourgmestre', 'gouverneur', 'admin', 'superadmin'
-- Use current_setting('jwt.claims.role', true) to read the role from the JWT claims
-- Helper table to map auth users to platform roles when JWT claim isn't present
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('citoyen','agent','bourgmestre','gouverneur','admin','superadmin')),
  commune text
);

-- Helper that returns the effective role for the current caller.
create or replace function public.current_role()
returns text language sql stable as $$
  select coalesce(
    nullif(current_setting('jwt.claims.role', true), ''),
    (select role from public.app_users where id = auth.uid())
  );
$$;

create policy if not exists "Select visible or privileged" on public.signalements
for select
using (
  -- visible active reports for everyone
  (active is not false)
  -- full access for privileged roles
  OR (public.current_role() IN ('agent', 'bourgmestre', 'gouverneur', 'admin', 'superadmin'))
  -- authors can always read their own reports
  OR (author_id = auth.uid())
);

create policy if not exists "Insert by citizen or auth" on public.signalements
for insert
with check (
  author is not null
  AND commune is not null
  AND category is not null
  AND urgency is not null
  -- allow if caller is the author (authenticated) or anonymous (public insert via anon key)
  AND (
    author_id = auth.uid()
    OR public.current_role() IS NULL
    OR public.current_role() IN ('citoyen', 'agent', 'bourgmestre', 'gouverneur', 'admin', 'superadmin')
  )
);

create policy if not exists "Update by author or privileged" on public.signalements
for update
using (
  -- only allow updates on visible records by the original author or by privileged roles
  (author_id = auth.uid())
  OR (public.current_role() IN ('agent', 'bourgmestre', 'gouverneur', 'admin', 'superadmin'))
)
with check (
  -- ensure active flag cannot be set to false by citizens (anonymous)
  NOT (public.current_role() IS NULL AND active = false)
);

create policy if not exists "Delete only by admin" on public.signalements
for delete
using (
  public.current_role() IN ('admin', 'superadmin')
);

-- End of RLS policies

-- Additional tables for admin features
create table if not exists public.ecokin_roles (
  id text primary key,
  name text not null unique,
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_ecokin_roles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_ecokin_roles_updated_at on public.ecokin_roles;
create trigger trg_set_ecokin_roles_updated_at
before update on public.ecokin_roles
for each row
execute function public.set_ecokin_roles_updated_at();

alter table public.ecokin_roles enable row level security;
create policy if not exists "manage roles by privileged" on public.ecokin_roles
for all
using (public.current_role() IN ('admin','superadmin'))
with check (public.current_role() IN ('admin','superadmin'));

create table if not exists public.ecokin_activities (
  id text primary key,
  title text not null,
  description text,
  assign_role text,
  assign_user text,
  status text not null default 'planned',
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_ecokin_activities_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_ecokin_activities_updated_at on public.ecokin_activities;
create trigger trg_set_ecokin_activities_updated_at
before update on public.ecokin_activities
for each row
execute function public.set_ecokin_activities_updated_at();

alter table public.ecokin_activities enable row level security;
create policy if not exists "manage activities by privileged" on public.ecokin_activities
for all
using (public.current_role() IN ('admin','superadmin'))
with check (public.current_role() IN ('admin','superadmin'));

create table if not exists public.ecokin_users (
  id text primary key,
  identifier text,
  name text,
  phone text,
  role text,
  commune text,
  permissions jsonb,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create or replace function public.set_ecokin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_ecokin_users_updated_at on public.ecokin_users;
create trigger trg_set_ecokin_users_updated_at
before update on public.ecokin_users
for each row
execute function public.set_ecokin_users_updated_at();

alter table public.ecokin_users enable row level security;
create policy if not exists "manage ecokin users" on public.ecokin_users
for all
using (public.current_role() IN ('admin','superadmin'))
with check (public.current_role() IN ('admin','superadmin'));
