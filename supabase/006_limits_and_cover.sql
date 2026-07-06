-- MomentDrop migration 006 — per-guest upload limit + event cover image.
-- Run ONCE in the Supabase SQL editor. Safe/idempotent (add column if not exists).

-- Max photos+videos a single guest may upload to this event. NULL = unlimited.
alter table events add column if not exists per_guest_limit int;

-- Google Drive file id for the owner-uploaded cover photo shown on the guest page.
alter table events add column if not exists cover_path text;
