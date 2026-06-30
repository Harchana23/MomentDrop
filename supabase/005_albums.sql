-- MomentDrop migration 005 — Albums. Run ONCE in the Supabase SQL editor.
-- Safe to re-run (idempotent).

create table if not exists albums (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  title         text not null,
  allow_uploads boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table uploads add column if not exists album_id uuid references albums(id) on delete set null;

create index if not exists idx_albums_event on albums (event_id);
create index if not exists idx_uploads_album on uploads (album_id);

alter table albums enable row level security;

create policy "own albums all" on albums for all
  using (exists (select 1 from events e where e.id = albums.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = albums.event_id and e.owner_id = auth.uid()));
