-- Power Cabinet — Supabase Schema
-- Run this in your Supabase SQL editor

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  is_pro boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ROSTERS (one active roster per user per season)
create table if not exists public.rosters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  season text not null default 'S1-2026',
  politician_ids text[] not null default '{}',
  captain_id text,
  dismissed_ids text[] not null default '{}',
  total_score integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, season)
);

-- LEADERBOARD VIEW (public read)
create or replace view public.leaderboard as
  select
    p.display_name,
    r.total_score,
    r.season,
    row_number() over (partition by r.season order by r.total_score desc) as rank
  from public.rosters r
  join public.profiles p on r.user_id = p.id
  where r.total_score > 0
  order by r.total_score desc;

-- AUTO-UPDATE updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger rosters_updated_at
  before update on public.rosters
  for each row execute function public.handle_updated_at();

-- AUTO-CREATE PROFILE on new user sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.rosters enable row level security;

-- Profiles: users manage their own
create policy "users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Rosters: users manage their own
create policy "users can view own roster"
  on public.rosters for select using (auth.uid() = user_id);

create policy "users can upsert own roster"
  on public.rosters for all using (auth.uid() = user_id);

-- Leaderboard: public read (no sensitive data exposed)
grant select on public.leaderboard to anon, authenticated;

-- INDEXES
create index if not exists rosters_user_season_idx on public.rosters (user_id, season);
create index if not exists rosters_score_idx on public.rosters (total_score desc);
