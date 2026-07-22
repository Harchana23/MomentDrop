-- MomentDrop migration 009 — Photo Wall settings. Run ONCE in the Supabase SQL editor.
-- Safe to re-run (idempotent).
--
-- Every column carries a default matching the previously hard-coded behaviour, so an
-- event that pre-dates this migration behaves exactly as it did before.

alter table events add column if not exists wall_slide_ms    int     not null default 6000;
alter table events add column if not exists wall_transition  text    not null default 'fade';
alter table events add column if not exists wall_order       text    not null default 'newest';
alter table events add column if not exists wall_jump_to_new boolean not null default true;
alter table events add column if not exists wall_show_name   boolean not null default true;
alter table events add column if not exists wall_show_title  boolean not null default true;
alter table events add column if not exists wall_show_qr     boolean not null default false;
alter table events add column if not exists wall_fit         text    not null default 'contain';
alter table events add column if not exists wall_blur_bg     boolean not null default true;

-- Guard the enums and the range at the database level too: the server action clamps
-- these, but a bad value here would break a wall that's live in front of a room.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_wall_slide_ms_range') then
    alter table events add constraint events_wall_slide_ms_range
      check (wall_slide_ms between 3000 and 30000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_wall_transition_valid') then
    alter table events add constraint events_wall_transition_valid
      check (wall_transition in ('fade', 'slide', 'none'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_wall_order_valid') then
    alter table events add constraint events_wall_order_valid
      check (wall_order in ('newest', 'oldest', 'shuffle'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_wall_fit_valid') then
    alter table events add constraint events_wall_fit_valid
      check (wall_fit in ('contain', 'cover'));
  end if;
end $$;
