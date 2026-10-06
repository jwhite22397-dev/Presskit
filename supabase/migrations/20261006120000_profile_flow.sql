-- Profile flow: referrals, founding codes, release status, product events.
-- Plan columns stay server-only. Clients cannot insert these rows.

alter table public.profiles drop constraint if exists profiles_plan_source_check;
alter table public.profiles
  add constraint profiles_plan_source_check
  check (plan_source in ('default', 'admin', 'simulated', 'stripe', 'founding'));

alter table public.profiles
  add column if not exists referred_by_slug text,
  add column if not exists referral_source text,
  add column if not exists referred_at timestamptz,
  add column if not exists onboarding_started_at timestamptz;

alter table public.releases drop constraint if exists releases_type_check;
alter table public.releases
  add constraint releases_type_check
  check (type in ('single', 'ep', 'mixtape', 'album', 'other'));

alter table public.releases
  add column if not exists release_status text not null default 'released',
  add column if not exists announcement_date date,
  add column if not exists prerelease_url text;

alter table public.releases drop constraint if exists releases_release_status_check;
alter table public.releases
  add constraint releases_release_status_check
  check (release_status in ('released', 'announced', 'prerelease'));

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.founding_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  entitlement text not null check (entitlement in ('pro', 'lifetime')),
  max_redemptions integer not null check (max_redemptions > 0 and max_redemptions <= 500),
  redemption_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.founding_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.founding_codes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

alter table public.product_events enable row level security;
alter table public.founding_codes enable row level security;
alter table public.founding_redemptions enable row level security;

revoke all on public.product_events from anon, authenticated;
revoke all on public.founding_codes from anon, authenticated;
revoke all on public.founding_redemptions from anon, authenticated;
