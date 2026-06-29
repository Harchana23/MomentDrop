-- MomentDrop schema — run ONCE in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- The app reads/writes with the service-role key, which bypasses RLS.

-- ── Tables ──────────────────────────────────────────────────────────────
create table if not exists events (
  id                  text primary key,             -- slug, e.g. 'harchana-wedding'
  name                text not null,
  date                date,
  timezone            text,
  drive_root_folder_id text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

create table if not exists guests (
  id            uuid primary key default gen_random_uuid(),
  event_id      text not null references events(id) on delete cascade,
  display_name  text,
  table_number  text,
  upload_count  int not null default 0,
  first_seen_at timestamptz not null default now()
);

create table if not exists uploads (
  id                  uuid primary key default gen_random_uuid(),
  event_id            text not null references events(id) on delete cascade,
  guest_name          text,
  original_file_name  text,
  media_type          text,
  status              text not null default 'Ready',
  drive_file_id       text,
  drive_web_view_link text,
  created_at          timestamptz not null default now()
);

create index if not exists idx_uploads_event_created on uploads (event_id, created_at desc);
create index if not exists idx_guests_event on guests (event_id);

-- ── RLS ─────────────────────────────────────────────────────────────────
-- Enabled with NO policies: anon/authenticated are denied; the server's
-- service-role key bypasses RLS. So the data is invisible to the public API.
alter table events  enable row level security;
alter table guests  enable row level security;
alter table uploads enable row level security;

-- ── Seed (event + TEST data; delete the test rows before the wedding) ────
insert into events (id, name, date, timezone, is_active)
values ('harchana-wedding', 'Harchana Wedding', '2026-06-29', 'Asia/Kuala_Lumpur', true)
on conflict (id) do nothing;

insert into uploads (event_id, guest_name, original_file_name, media_type, status) values
  ('harchana-wedding', 'Test Maya', 'beach-sunset.jpg', 'photo', 'Ready'),
  ('harchana-wedding', 'Test Arun', 'first-dance.mov', 'video', 'Ready');

insert into guests (event_id, display_name, upload_count) values
  ('harchana-wedding', 'Test Maya', 1);
