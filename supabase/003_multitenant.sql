-- MomentDrop migration 003 — multi-tenant schema. Run ONCE in the Supabase SQL editor.
-- WARNING: drops the old single-event tables and their data (disposable test data).

drop table if exists uploads cascade;
drop table if exists guests  cascade;
drop table if exists events  cascade;

-- profiles: one row per owner (auth user)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

-- events: owned by a profile; carries its own plan/limits/expiry + access toggles
create table events (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references profiles(id) on delete cascade,
  slug                text not null unique,
  title               text not null,
  event_type          text not null default 'wedding',
  event_date          date,
  eyebrow             text,
  host_message        text,
  plan                text not null default 'trial',
  file_limit          int  not null default 30,
  active_until        timestamptz not null default (now() + interval '7 days'),
  status              text not null default 'active',
  allow_uploads       boolean not null default true,
  allow_downloads     boolean not null default true,
  require_approval    boolean not null default false,
  guests_see_only_own boolean not null default false,
  password_hash       text,
  created_at          timestamptz not null default now()
);

create table uploads (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events(id) on delete cascade,
  guest_name         text,
  original_file_name text,
  media_type         text,
  storage_path       text,
  mime_type          text,
  size_bytes         bigint,
  review_status      text not null default 'published',
  created_at         timestamptz not null default now()
);

create table guests (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  display_name  text,
  email         text,
  upload_count  int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_events_owner          on events (owner_id);
create index idx_events_slug           on events (slug);
create index idx_uploads_event_created on uploads (event_id, created_at desc);
create index idx_guests_event          on guests (event_id);

-- RLS
alter table profiles enable row level security;
alter table events   enable row level security;
alter table uploads  enable row level security;
alter table guests   enable row level security;

create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

create policy "own events all" on events for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own uploads all" on uploads for all
  using (exists (select 1 from events e where e.id = uploads.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = uploads.event_id and e.owner_id = auth.uid()));

create policy "own guests all" on guests for all
  using (exists (select 1 from events e where e.id = guests.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = guests.event_id and e.owner_id = auth.uid()));

-- auto-create a profile row when a user signs up
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
