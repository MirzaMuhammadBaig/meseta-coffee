-- ============================================================
-- Add `closed_until` so the admin can schedule a re-open time
-- when the store is temporarily closed (shown on the public banner).
-- ============================================================

alter table public.store_settings
  add column if not exists closed_until timestamptz;
