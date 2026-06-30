-- MomentDrop migration 002 — add Supabase Storage columns to existing `uploads`.
-- Run ONCE in the Supabase SQL editor if you already ran the original schema.sql.
-- Safe to re-run (idempotent).

alter table uploads add column if not exists storage_path text;
alter table uploads add column if not exists mime_type   text;
alter table uploads add column if not exists size_bytes  bigint;

-- Optional: remove the seed/test rows before the real event.
-- delete from uploads where guest_name in ('Test Maya', 'Test Arun');
-- delete from guests  where display_name = 'Test Maya';
