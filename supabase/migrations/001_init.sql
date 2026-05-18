-- ============================================================
-- Meseta Coffee, initial Supabase schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- ============================================================

-- ─── extensions ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── menu_categories ────────────────────────────────────────
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── menu_items ─────────────────────────────────────────────
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text,
  price_pkr int not null,
  image_url text,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_signature boolean not null default false,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── reviews (sourced from Google, foodpanda, social) ───────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('google','foodpanda','instagram','facebook','tripadvisor','manual')),
  author_name text not null,
  author_avatar_url text,
  rating int not null check (rating between 1 and 5),
  body text not null,
  reviewed_at date,
  external_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── reservations (booking requests) ────────────────────────
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  party_size int not null check (party_size between 1 and 30),
  reserved_for timestamptz not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','seated','cancelled','no_show')),
  created_at timestamptz not null default now()
);

-- ─── contact_messages (general inquiries) ───────────────────
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── newsletter_subscribers ─────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz not null default now()
);

-- ─── gallery_images ─────────────────────────────────────────
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Row-Level Security ─────────────────────────────────────
alter table public.menu_categories       enable row level security;
alter table public.menu_items            enable row level security;
alter table public.reviews               enable row level security;
alter table public.reservations          enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.gallery_images        enable row level security;

-- Public read for marketing content
create policy "menu_categories_read"  on public.menu_categories  for select using (true);
create policy "menu_items_read"       on public.menu_items       for select using (true);
create policy "reviews_read"          on public.reviews          for select using (true);
create policy "gallery_images_read"   on public.gallery_images   for select using (true);

-- Public can insert their own reservation / message / newsletter signup.
-- Reads on these are restricted to service-role (no policy).
create policy "reservations_insert"   on public.reservations          for insert with check (true);
create policy "contact_messages_insert" on public.contact_messages    for insert with check (true);
create policy "newsletter_insert"     on public.newsletter_subscribers for insert with check (true);

-- ─── Seed: menu categories ──────────────────────────────────
insert into public.menu_categories (slug, name, description, sort_order) values
  ('signature',  'Signature Drinks', 'Meseta originals you won''t find anywhere else', 1),
  ('espresso',   'Espresso Bar',     'Classic espresso-based drinks pulled on our La Marzocco', 2),
  ('matcha',     'Matcha & Tea',     'Ceremonial-grade matcha, lattes and seasonal teas', 3),
  ('cold-brew',  'Cold Brew & Iced', '24-hour cold-brewed and ice-shaken refreshers', 4),
  ('sandwiches', 'Sandwiches',       'House-pressed sandwiches on artisan bread', 5),
  ('bakery',     'Bakery & Desserts','Baked in-house every morning', 6)
on conflict (slug) do nothing;

-- ─── Seed: menu items ───────────────────────────────────────
insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, is_signature, tags, sort_order)
select id, 'meseta-layered-latte', 'Meseta Layered Latte',
       'Our signature triple-layered latte with espresso, steamed milk and a cocoa-dust finish.',
       950, null, true, true, array['signature','hot'], 1
from public.menu_categories where slug='signature' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, is_signature, tags, sort_order)
select id, 'turkish-matcha', 'Turkish Matcha',
       'Whisked ceremonial matcha layered with rose syrup and frothed milk.',
       1050, null, true, true, array['signature','matcha'], 2
from public.menu_categories where slug='signature' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, tags, sort_order)
select id, 'cappuccino', 'Cappuccino',
       'Velvety microfoam over a double shot of single-origin espresso.',
       750, null, true, array['hot','classic'], 1
from public.menu_categories where slug='espresso' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, tags, sort_order)
select id, 'flat-white', 'Flat White',
       'Ristretto pulled shots, silky steamed milk, no foam.',
       800, null, array['hot','classic'], 2
from public.menu_categories where slug='espresso' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, tags, sort_order)
select id, 'caramel-macchiato', 'Caramel Macchiato',
       'Espresso, vanilla, steamed milk, finished with house caramel.',
       900, null, array['hot','flavoured'], 3
from public.menu_categories where slug='espresso' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, tags, sort_order)
select id, 'matcha-latte', 'Matcha Latte',
       'Ceremonial matcha whisked with steamed milk, hot or iced.',
       950, null, true, array['matcha'], 1
from public.menu_categories where slug='matcha' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, tags, sort_order)
select id, 'strawberry-matcha', 'Strawberry Matcha',
       'Fresh strawberry purée, matcha and cold milk over ice.',
       1100, null, array['matcha','iced'], 2
from public.menu_categories where slug='matcha' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, tags, sort_order)
select id, 'classic-cold-brew', 'Classic Cold Brew',
       'Steeped for 24 hours, served straight over ice. Smooth, low-acid.',
       850, null, true, array['iced','cold-brew'], 1
from public.menu_categories where slug='cold-brew' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, tags, sort_order)
select id, 'vanilla-sweet-cream', 'Vanilla Sweet-Cream Cold Brew',
       'Cold brew topped with vanilla sweet cream cascade.',
       950, null, array['iced','cold-brew'], 2
from public.menu_categories where slug='cold-brew' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, tags, sort_order)
select id, 'chipotle-chicken', 'Chipotle Chicken Sandwich',
       'Grilled chicken, smoky chipotle aioli, pickled onion on house ciabatta.',
       1250, null, true, array['food'], 1
from public.menu_categories where slug='sandwiches' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, tags, sort_order)
select id, 'truffle-mushroom', 'Truffle Mushroom Melt',
       'Sauteed mushrooms, mozzarella and truffle oil on sourdough.',
       1350, null, array['food','vegetarian'], 2
from public.menu_categories where slug='sandwiches' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, is_bestseller, tags, sort_order)
select id, 'walnut-fudge-brownie', 'Walnut Fudge Brownie',
       'Rich, moist, and packed with toasted walnuts. Guests order it twice.',
       550, null, true, array['dessert'], 1
from public.menu_categories where slug='bakery' on conflict (slug) do nothing;

insert into public.menu_items (category_id, slug, name, description, price_pkr, image_url, tags, sort_order)
select id, 'tiramisu', 'Classic Tiramisu',
       'Mascarpone, espresso-soaked ladyfingers, cocoa.',
       650, null, array['dessert'], 2
from public.menu_categories where slug='bakery' on conflict (slug) do nothing;

-- ─── Seed: reviews (from public Google / foodpanda excerpts) ─
insert into public.reviews (source, author_name, rating, body, reviewed_at, is_featured) values
  ('google', 'Mustafa K.', 5,
   'I tried their walnut fudge brownie, absolutely amazing! Rich, moist, and packed with flavor. Definitely recommend it.',
   '2025-07-26', true),
  ('google', 'Shajee R.', 5,
   'Amazing experience. The sandwiches, they are soo good. Quality is always the same level of good. My go-to order and I go there twice a week.',
   '2025-11-13', true),
  ('google', 'Aiman F.', 5,
   'Cozy vibes, brilliant matcha, and the team makes you feel like a regular from day one.',
   '2025-09-04', true),
  ('google', 'Hassan A.', 4,
   'Great place to work from. Wi-Fi is fast, music is on-point and the cold brew keeps you going.',
   '2025-06-18', true),
  ('google', 'Sara M.', 5,
   'Brought my kids, the Jenga and Ludo at the table were a hit. Coffee was excellent too!',
   '2025-08-22', true)
on conflict do nothing;
