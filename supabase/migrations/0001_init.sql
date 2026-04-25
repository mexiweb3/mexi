-- Pianitos · initial schema
-- Idempotent. Safe to re-run on a fresh Supabase project.

set check_function_bodies = off;

-- ---------- extensions
create extension if not exists pgcrypto;

-- ---------- tables

create table if not exists public.profiles_parent (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  consent_signed_at timestamptz,
  consent_ip inet,
  locale text not null default 'es-419',
  plan text not null default 'free' check (plan in ('free', 'premium')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles_child (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles_parent(id) on delete cascade,
  name text not null,
  age int not null check (age between 5 and 14),
  avatar text not null check (avatar in ('a1','a2','a3','a4','a5','a6')),
  keyboard_brand text check (keyboard_brand in ('yamaha','casio','otro','ninguno')),
  created_at timestamptz not null default now()
);
create index if not exists profiles_child_parent_idx on public.profiles_child(parent_id);

create table if not exists public.lessons (
  id text primary key,
  module int not null,
  order_in_module int not null,
  title text not null,
  is_premium boolean not null default false,
  duration_min int not null default 5
);

create table if not exists public.child_progress (
  child_id uuid not null references public.profiles_child(id) on delete cascade,
  lesson_id text not null references public.lessons(id),
  stars int check (stars between 0 and 3),
  best_score int,
  completed_at timestamptz,
  total_time_sec int not null default 0,
  attempts int not null default 0,
  primary key (child_id, lesson_id)
);

create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null
);

create table if not exists public.child_badges (
  child_id uuid not null references public.profiles_child(id) on delete cascade,
  badge_id text not null references public.badges(id),
  awarded_at timestamptz not null default now(),
  primary key (child_id, badge_id)
);

create table if not exists public.subscriptions (
  parent_id uuid primary key references public.profiles_parent(id) on delete cascade,
  stripe_sub_id text,
  status text,
  current_period_end timestamptz,
  cancel_at timestamptz
);

create table if not exists public.events (
  id bigserial primary key,
  parent_id uuid,
  child_id uuid,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_parent_idx on public.events(parent_id, created_at desc);
create index if not exists events_child_idx on public.events(child_id, created_at desc);

-- ---------- updated_at trigger

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_parent_touch on public.profiles_parent;
create trigger profiles_parent_touch
  before update on public.profiles_parent
  for each row execute function public.touch_updated_at();

-- ---------- auto-create parent profile on signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles_parent (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS

alter table public.profiles_parent enable row level security;
alter table public.profiles_child enable row level security;
alter table public.child_progress enable row level security;
alter table public.child_badges enable row level security;
alter table public.subscriptions enable row level security;
alter table public.events enable row level security;
alter table public.lessons enable row level security;
alter table public.badges enable row level security;

-- public catalog: anyone authenticated can read
drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons
  for select using (true);

drop policy if exists badges_read on public.badges;
create policy badges_read on public.badges
  for select using (true);

-- parent owns own row
drop policy if exists profiles_parent_self on public.profiles_parent;
create policy profiles_parent_self on public.profiles_parent
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- parent owns their children
drop policy if exists profiles_child_owner on public.profiles_child;
create policy profiles_child_owner on public.profiles_child
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- child progress: parent of that child
drop policy if exists child_progress_owner on public.child_progress;
create policy child_progress_owner on public.child_progress
  for all using (
    exists (
      select 1 from public.profiles_child c
      where c.id = child_progress.child_id and c.parent_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.profiles_child c
      where c.id = child_progress.child_id and c.parent_id = auth.uid()
    )
  );

-- child badges: same rule
drop policy if exists child_badges_owner on public.child_badges;
create policy child_badges_owner on public.child_badges
  for all using (
    exists (
      select 1 from public.profiles_child c
      where c.id = child_badges.child_id and c.parent_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.profiles_child c
      where c.id = child_badges.child_id and c.parent_id = auth.uid()
    )
  );

-- subscriptions: parent only reads own; writes happen via service role from webhook
drop policy if exists subscriptions_self_read on public.subscriptions;
create policy subscriptions_self_read on public.subscriptions
  for select using (parent_id = auth.uid());

-- events: parent reads own; writes via service role
drop policy if exists events_self_read on public.events;
create policy events_self_read on public.events
  for select using (parent_id = auth.uid());
