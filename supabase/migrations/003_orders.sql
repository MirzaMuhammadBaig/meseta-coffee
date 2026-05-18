-- ============================================================
-- Orders, with Safepay-friendly status columns.
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,            -- short code shown to the guest, e.g. MES-A1B2C3

  -- Customer
  customer_name text not null,
  customer_phone text not null,
  customer_email text,

  -- Fulfilment (kept generic; default to pickup since Meseta is dine-in/pickup-first)
  fulfilment text not null default 'pickup'
    check (fulfilment in ('pickup','delivery','dine_in')),
  address text,

  -- Cart snapshot — keep the prices we charged, not just the slugs, so
  -- the order remains accurate even if the menu price changes later.
  items jsonb not null,                   -- [{slug,name,qty,price_pkr}]
  subtotal_pkr int not null check (subtotal_pkr >= 0),
  total_pkr int not null check (total_pkr >= 0),

  -- Payment
  payment_method text not null
    check (payment_method in ('card','whatsapp','cash')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','authorized','captured','failed','cancelled','refunded')),
  safepay_tracker text,                   -- Safepay transaction tracker / session id
  paid_at timestamptz,

  -- Lifecycle
  status text not null default 'placed'
    check (status in ('placed','accepted','preparing','ready','completed','cancelled')),

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_safepay_tracker_idx
  on public.orders(safepay_tracker);

create index if not exists orders_created_at_idx
  on public.orders(created_at desc);

-- Touch updated_at on every UPDATE
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ─── Row-Level Security ─────────────────────────────────────
alter table public.orders enable row level security;

-- Guests can insert orders (the API route uses the service-role key, but
-- this lets a future client-side path also work if we ever want one).
create policy "orders_insert" on public.orders
  for insert with check (true);

-- No public read/update policies. Only the service role (server-side)
-- can read or change orders. That's intentional.
