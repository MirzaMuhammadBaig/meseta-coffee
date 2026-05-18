-- ============================================================
-- Admin dashboard schema:
--   • admin_users     — who has access to /admin
--   • store_settings  — single-row config: open/closed, hours, contact
--   • deals           — promotional offers (e.g. "Matcha Monday 20% off")
--   • coupons         — discount codes with limits + redemptions
--   • menu_items      — gain `is_disabled` so an admin can hide an item
--                       without deleting it
-- ============================================================

-- ─── admin_users ────────────────────────────────────────────
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin','owner','staff')),
  created_at timestamptz not null default now()
);

-- Helper: is the current request from an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, auth as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid()
  );
$$;

-- ─── store_settings (singleton) ─────────────────────────────
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),    -- only ever one row
  is_open boolean not null default true,
  closed_message text default 'We''re closed right now — please check back soon.',
  show_announcement boolean not null default false,
  announcement_text text,
  -- weekly hours stored as jsonb for flexibility
  hours jsonb not null default '[
    {"day":"Monday","open":"09:00","close":"01:00"},
    {"day":"Tuesday","open":"09:00","close":"01:00"},
    {"day":"Wednesday","open":"09:00","close":"01:00"},
    {"day":"Thursday","open":"09:00","close":"01:00"},
    {"day":"Friday","open":"09:00","close":"02:00"},
    {"day":"Saturday","open":"09:00","close":"02:00"},
    {"day":"Sunday","open":"09:00","close":"01:00"}
  ]'::jsonb,
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  social_instagram text,
  social_facebook text,
  accept_card_payments boolean not null default true,
  accept_cash_payments boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists store_settings_touch on public.store_settings;
create trigger store_settings_touch
  before update on public.store_settings
  for each row execute function public.touch_updated_at();

-- ─── deals ───────────────────────────────────────────────────
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image_url text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value int not null check (discount_value >= 0),
  applies_to text not null default 'all' check (applies_to in ('all','category','item')),
  target_slug text,                              -- category_slug or menu_item.slug
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_active_idx on public.deals(is_active, ends_at);

drop trigger if exists deals_touch on public.deals;
create trigger deals_touch
  before update on public.deals
  for each row execute function public.touch_updated_at();

-- ─── coupons ─────────────────────────────────────────────────
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                     -- e.g. WELCOME10
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value int not null check (discount_value >= 0),
  min_subtotal_pkr int default 0 check (min_subtotal_pkr >= 0),
  max_uses int,                                  -- null = unlimited
  uses_count int not null default 0 check (uses_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coupons_code_active_idx
  on public.coupons(code) where is_active = true;

drop trigger if exists coupons_touch on public.coupons;
create trigger coupons_touch
  before update on public.coupons
  for each row execute function public.touch_updated_at();

-- ─── menu_items: add admin-friendly columns ─────────────────
alter table public.menu_items
  add column if not exists is_disabled boolean not null default false;

alter table public.menu_items
  add column if not exists stock int;     -- null = unlimited

-- ─── orders: add discount columns ───────────────────────────
alter table public.orders
  add column if not exists discount_pkr int not null default 0;

alter table public.orders
  add column if not exists coupon_code text;

-- ─── Row-Level Security ─────────────────────────────────────
alter table public.admin_users    enable row level security;
alter table public.store_settings enable row level security;
alter table public.deals          enable row level security;
alter table public.coupons        enable row level security;

-- store_settings + deals + coupons: public can READ active rows
create policy "store_settings_read"  on public.store_settings for select using (true);

create policy "deals_read_active"    on public.deals for select using (is_active = true);
create policy "coupons_read_active"  on public.coupons for select using (is_active = true);

-- Admins (rows in admin_users) can do everything on every admin table.
create policy "admin_users_admin"    on public.admin_users
  for all using (public.is_admin()) with check (public.is_admin());
create policy "store_settings_admin" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());
create policy "deals_admin"          on public.deals
  for all using (public.is_admin()) with check (public.is_admin());
create policy "coupons_admin"        on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Admins also need full read/write on the existing operational tables.
do $$
begin
  -- orders
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_admin'
  ) then
    create policy "orders_admin" on public.orders
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  -- reservations
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='reservations' and policyname='reservations_admin'
  ) then
    create policy "reservations_admin" on public.reservations
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  -- contact_messages
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='contact_messages' and policyname='contact_messages_admin'
  ) then
    create policy "contact_messages_admin" on public.contact_messages
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  -- newsletter_subscribers
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='newsletter_subscribers' and policyname='newsletter_admin'
  ) then
    create policy "newsletter_admin" on public.newsletter_subscribers
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  -- menu_items + menu_categories + reviews + gallery_images
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='menu_items' and policyname='menu_items_admin'
  ) then
    create policy "menu_items_admin" on public.menu_items
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='menu_categories' and policyname='menu_categories_admin'
  ) then
    create policy "menu_categories_admin" on public.menu_categories
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_admin'
  ) then
    create policy "reviews_admin" on public.reviews
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gallery_images' and policyname='gallery_admin'
  ) then
    create policy "gallery_admin" on public.gallery_images
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- ─── Bootstrap your first admin ────────────────────────────
-- After running this migration:
--   1. Go to Supabase Auth → "Add user" → create the owner account
--      with email + password.
--   2. Copy that user's UUID and run:
--
--      insert into public.admin_users (id, email, full_name, role)
--      values ('<uuid>', '<email>', 'Your Name', 'owner');
--
-- That account can now sign in at /admin/login.
