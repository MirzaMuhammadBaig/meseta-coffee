-- ============================================================
-- Adds an `ends_at` column to reservations so guests can book
-- a start AND end time (the form now captures both).
-- ============================================================

alter table public.reservations
  add column if not exists ends_at timestamptz;

-- Optional: enforce end > start at the database layer so bad data
-- can't sneak in even if the API check is bypassed.
alter table public.reservations
  drop constraint if exists reservations_ends_after_start;

alter table public.reservations
  add constraint reservations_ends_after_start
  check (ends_at is null or ends_at > reserved_for);
