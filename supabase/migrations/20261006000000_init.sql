-- PRESSKIT initial schema
-- Apply with the Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'lifetime')),
  plan_source text not null default 'default' check (plan_source in ('default', 'admin', 'simulated', 'stripe')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artist_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  onboarding_completed boolean not null default false,
  artist_name text not null,
  real_name text,
  city text,
  genre text,
  tagline text,
  short_bio text,
  full_bio text,
  profile_image_url text,
  hero_image_url text,
  booking_email text,
  management_email text,
  press_email text,
  theme text not null default 'editorial' check (theme in ('editorial', 'night', 'minimal', 'neon')),
  accent_color text not null default 'theme',
  font_pairing text not null default 'editorial',
  section_order jsonb not null default '["music","videos","about","shows","press","gallery","highlights","contact"]'::jsonb,
  hidden_sections jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  public_plan text not null default 'free' check (public_plan in ('free', 'pro', 'lifetime')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.releases (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  title text not null,
  type text not null check (type in ('single', 'ep', 'mixtape', 'album')),
  cover_url text,
  release_date date,
  description text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.release_links (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases (id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  title text not null,
  url text not null,
  thumbnail_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shows (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  event_name text not null,
  venue text not null,
  city text not null,
  state text,
  country text not null default 'USA',
  date date not null,
  time text,
  ticket_url text,
  is_sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.press_items (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  publication text not null,
  headline text,
  quote text not null,
  article_url text,
  date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.custom_links (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  label text not null,
  url text not null,
  icon text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.career_highlights (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  event_type text not null check (event_type in (
    'page_view', 'music_click', 'social_click', 'booking_click', 'ticket_click',
    'custom_link_click', 'epk_view', 'pdf_download', 'video_click'
  )),
  event_data jsonb,
  referrer text,
  user_agent text,
  country text,
  created_at timestamptz not null default now()
);

create table public.slug_redirects (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  from_slug text not null unique,
  to_slug text not null,
  created_at timestamptz not null default now()
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.artist_sites (id) on delete cascade,
  hostname text not null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now()
);

create index artist_sites_user_id_idx on public.artist_sites (user_id);
create index releases_site_id_idx on public.releases (site_id);
create index release_links_release_id_idx on public.release_links (release_id);
create index videos_site_id_idx on public.videos (site_id);
create index shows_site_id_idx on public.shows (site_id, date);
create index press_items_site_id_idx on public.press_items (site_id);
create index gallery_images_site_id_idx on public.gallery_images (site_id);
create index social_links_site_id_idx on public.social_links (site_id);
create index custom_links_site_id_idx on public.custom_links (site_id);
create index career_highlights_site_id_idx on public.career_highlights (site_id);
create index analytics_events_site_created_idx on public.analytics_events (site_id, created_at desc);
create index slug_redirects_from_idx on public.slug_redirects (from_slug);

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger artist_sites_updated_at before update on public.artist_sites
for each row execute function public.set_updated_at();
create trigger releases_updated_at before update on public.releases
for each row execute function public.set_updated_at();
create trigger videos_updated_at before update on public.videos
for each row execute function public.set_updated_at();
create trigger shows_updated_at before update on public.shows
for each row execute function public.set_updated_at();
create trigger press_items_updated_at before update on public.press_items
for each row execute function public.set_updated_at();
create trigger custom_links_updated_at before update on public.custom_links
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_public_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.artist_sites set public_plan = new.plan where user_id = new.id;
  return new;
end;
$$;

create trigger profiles_sync_plan
after update of plan on public.profiles
for each row execute function public.sync_public_plan();

create or replace function public.enforce_site_owner_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_plan text;
begin
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    raise exception 'Site ownership cannot be changed';
  end if;
  select plan into owner_plan from public.profiles where id = new.user_id;
  new.public_plan := coalesce(owner_plan, 'free');
  return new;
end;
$$;

create trigger artist_sites_enforce_plan
before insert or update on public.artist_sites
for each row execute function public.enforce_site_owner_fields();

alter table public.profiles enable row level security;
alter table public.artist_sites enable row level security;
alter table public.releases enable row level security;
alter table public.release_links enable row level security;
alter table public.videos enable row level security;
alter table public.shows enable row level security;
alter table public.press_items enable row level security;
alter table public.gallery_images enable row level security;
alter table public.social_links enable row level security;
alter table public.custom_links enable row level security;
alter table public.career_highlights enable row level security;
alter table public.analytics_events enable row level security;
alter table public.slug_redirects enable row level security;
alter table public.domains enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select (id, display_name, avatar_url, plan, subscription_status, created_at, updated_at) on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create policy "read own profile" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "public read published sites" on public.artist_sites
for select to anon, authenticated using (status = 'published');
create policy "owners read sites" on public.artist_sites
for select to authenticated using (user_id = auth.uid());
create policy "owners insert sites" on public.artist_sites
for insert to authenticated with check (user_id = auth.uid());
create policy "owners update sites" on public.artist_sites
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owners delete sites" on public.artist_sites
for delete to authenticated using (user_id = auth.uid());

-- Child-table helper policies are repeated per table.
do $$
declare
  child text;
begin
  foreach child in array ARRAY[
    'releases', 'videos', 'shows', 'press_items', 'gallery_images',
    'social_links', 'custom_links', 'career_highlights'
  ]
  loop
    execute format(
      'create policy "public read %1$s" on public.%1$s for select to anon, authenticated using (exists (select 1 from public.artist_sites s where s.id = site_id and s.status = ''published''))',
      child
    );
    execute format(
      'create policy "owners manage %1$s" on public.%1$s for all to authenticated using (exists (select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid())) with check (exists (select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid()))',
      child
    );
  end loop;
end $$;

create policy "public read release links" on public.release_links
for select to anon, authenticated
using (exists (
  select 1 from public.releases r
  join public.artist_sites s on s.id = r.site_id
  where r.id = release_links.release_id and s.status = 'published'
));

create policy "owners manage release links" on public.release_links
for all to authenticated
using (exists (
  select 1 from public.releases r
  join public.artist_sites s on s.id = r.site_id
  where r.id = release_links.release_id and s.user_id = auth.uid()
))
with check (exists (
  select 1 from public.releases r
  join public.artist_sites s on s.id = r.site_id
  where r.id = release_links.release_id and s.user_id = auth.uid()
));

create policy "public insert analytics" on public.analytics_events
for insert to anon, authenticated
with check (exists (
  select 1 from public.artist_sites s where s.id = site_id and s.status = 'published'
));

create policy "owners read analytics" on public.analytics_events
for select to authenticated
using (exists (
  select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid()
));

create policy "public read redirects" on public.slug_redirects
for select to anon, authenticated using (true);

create policy "owners manage redirects" on public.slug_redirects
for all to authenticated
using (exists (select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid()));

create policy "owners read domains" on public.domains
for select to authenticated
using (exists (select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid()));

create policy "owners insert domains" on public.domains
for insert to authenticated
with check (exists (select 1 from public.artist_sites s where s.id = site_id and s.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
for select to public using (bucket_id = 'media');

create policy "owners upload media" on storage.objects
for insert to authenticated
with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners update media" on storage.objects
for update to authenticated
using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners delete media" on storage.objects
for delete to authenticated
using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
