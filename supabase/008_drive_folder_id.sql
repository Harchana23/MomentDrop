-- MomentDrop migration 008 — pin each event to its Drive folder by id.
-- Run ONCE in the Supabase SQL editor. Safe/idempotent.

-- The event's Google Drive folder id, captured on first use. Storing the id (not
-- the slug) means changing the event URL never orphans the folder, and delete
-- always trashes the right one. Existing events adopt their current folder lazily.
alter table events add column if not exists drive_folder_id text;
