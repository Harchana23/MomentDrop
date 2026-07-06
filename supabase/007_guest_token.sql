-- MomentDrop migration 007 — per-device guest token, for a sturdier per-guest limit.
-- Run ONCE in the Supabase SQL editor. Safe/idempotent.

-- A random token stored in the guest's browser cookie, so the per-guest cap can't
-- be reset just by typing a different name on the same device.
alter table uploads add column if not exists guest_token text;
create index if not exists idx_uploads_event_token on uploads (event_id, guest_token);
