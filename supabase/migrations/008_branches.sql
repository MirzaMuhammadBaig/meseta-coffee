-- ============================================================
-- Phase 1 of multi-branch support.
--
-- Adds a `branches` table (Phase 4 + DHA-1 seeded) and a
-- nullable `branch_id` foreign key on the two transactional
-- tables that customers interact with: orders + reservations.
--
-- Existing rows are backfilled to Phase 4 (the original /
-- flagship branch) so historical data is not orphaned.
-- ============================================================

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_name text,                       -- "Phase 4" / "DHA-1" for nav chip

  -- Address + contact
  address_line1 text,
  address_line2 text,
  city text,
  country text default 'Pakistan',
  phone text,
  whatsapp text,
  email text,

  -- Map embed
  google_maps_url text,
  google_embed_url text,
  google_place_id text,

  -- Public rating snapshot (manually edited; not auto-synced from Google)
  google_rating numeric(2,1) default 0,
  google_review_count int default 0,

  -- Display order on branch picker
  sort_order int not null default 0,
  is_active boolean not null default true,

  -- Flag the original branch so the UI can mark it as "main" / default
  is_main boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists branches_active_idx
  on public.branches(is_active, sort_order);

-- Anon (public) can read active branches — needed for the customer
-- branch picker. RLS would also be fine here, kept off for simplicity
-- since `branches` rows are not sensitive.
alter table public.branches enable row level security;

drop policy if exists "branches_read_active" on public.branches;
create policy "branches_read_active" on public.branches
  for select using (is_active = true);

drop policy if exists "branches_admin_write" on public.branches;
create policy "branches_admin_write" on public.branches
  for all using (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- Add branch_id to orders + reservations, NULLABLE so the
-- column can ship before all code paths set it. Backfill +
-- index + (optional) NOT NULL can come later once every code
-- path is verified to set it.
-- ────────────────────────────────────────────────────────────
alter table public.orders
  add column if not exists branch_id uuid references public.branches(id);

create index if not exists orders_branch_idx
  on public.orders(branch_id, created_at desc);

alter table public.reservations
  add column if not exists branch_id uuid references public.branches(id);

create index if not exists reservations_branch_idx
  on public.reservations(branch_id, reserved_for desc);

-- ────────────────────────────────────────────────────────────
-- Seed the two real branches. Phase 4 is the original /
-- flagship (4.5★, 1,072+ reviews on Google), DHA-1 is the
-- newer outlet (4.3★, 222 reviews).
--
-- INSERT ... ON CONFLICT so re-running the migration is safe.
-- ────────────────────────────────────────────────────────────
insert into public.branches (
  slug, name, short_name,
  address_line1, address_line2, city,
  phone, email,
  google_maps_url, google_embed_url,
  google_rating, google_review_count,
  sort_order, is_main
) values
(
  'bahria-phase-4',
  'Meseta Coffee — Bahria Town Phase 4',
  'Phase 4',
  'The Riviera, Street 41-A',
  'Phase 4, Bahria Town',
  'Rawalpindi',
  '+92 51 6102679',
  'mesetapakistan@gmail.com',
  'https://maps.google.com/?q=Meseta+Coffee+Bahria+Town+Phase+4+Rawalpindi',
  'https://www.google.com/maps?q=Meseta+Coffee+Bahria+Town+Phase+4+Rawalpindi&output=embed',
  4.5, 1072,
  1, true
),
(
  'dha-phase-1',
  'Meseta Coffee — DHA Phase 1',
  'DHA-1',
  'Sector F, DHA Phase 1',
  null,
  'Rawalpindi',
  null,
  'mesetapakistan@gmail.com',
  'https://maps.google.com/?q=Meseta+Coffee+DHA+Phase+1+Sector+F+Rawalpindi',
  'https://www.google.com/maps?q=Meseta+Coffee+DHA+Phase+1+Sector+F+Rawalpindi&output=embed',
  4.3, 222,
  2, false
)
on conflict (slug) do nothing;

-- Backfill: every existing order / reservation belongs to the original
-- branch (Phase 4) until proven otherwise. We resolve the id by slug
-- so the migration works on any environment.
update public.orders
   set branch_id = (select id from public.branches where slug = 'bahria-phase-4')
 where branch_id is null;

update public.reservations
   set branch_id = (select id from public.branches where slug = 'bahria-phase-4')
 where branch_id is null;

-- Touch updated_at trigger for branches (re-uses the existing
-- public.touch_updated_at() created in 003_orders.sql).
drop trigger if exists branches_touch_updated_at on public.branches;
create trigger branches_touch_updated_at
  before update on public.branches
  for each row execute function public.touch_updated_at();
