-- MomentDrop migration 004 — Countdown. Run ONCE in the Supabase SQL editor.
-- Safe to re-run (idempotent).

alter table events add column if not exists countdown_enabled boolean not null default false;
alter table events add column if not exists countdown_title   text;
alter table events add column if not exists countdown_until    timestamptz;
