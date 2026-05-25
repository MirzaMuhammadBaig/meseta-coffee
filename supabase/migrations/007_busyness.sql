-- ============================================================
-- Busyness level + auto-progress timings.
--
-- New on `store_settings`:
--   • busyness_level         — normal | busy | super_busy (default normal)
--   • auto_progress_minutes  — { placed_to_accepted, accepted_to_preparing,
--                               preparing_to_ready } in MINUTES
--
-- New on `orders`:
--   • auto_advance_at        — when this order should auto-advance next.
--                              null once it reaches `ready` or a manual
--                              terminal state (completed/cancelled).
--
-- The effective time at each transition = base minute × busyness multiplier:
--   normal     × 1
--   busy       × 2
--   super_busy × 3
-- ============================================================

alter table public.store_settings
  add column if not exists busyness_level text not null default 'normal'
    check (busyness_level in ('normal', 'busy', 'super_busy'));

alter table public.store_settings
  add column if not exists auto_progress_minutes jsonb not null default
    '{"placed_to_accepted":2,"accepted_to_preparing":5,"preparing_to_ready":5}'::jsonb;

alter table public.orders
  add column if not exists auto_advance_at timestamptz;

-- Index just the rows that actually need to be ticked.
create index if not exists orders_auto_advance_idx
  on public.orders(auto_advance_at)
  where auto_advance_at is not null;
