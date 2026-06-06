# Meseta Coffee — full-stack café platform

A production-ready public website + operator dashboard for **Meseta Coffee** (Bahria Town Phase 4 — main, and DHA Phase 1 — Rawalpindi). Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Supabase** (Auth + Postgres + RLS) and **Safepay** (Pakistan card payments).

> Online ordering, table reservations, contact + reviews on the customer side. Multi-branch routing, full inventory, deals, coupons, order pipeline, content management and a live store-status / busyness controller on the admin side. Every order and reservation is tagged to the branch the customer chose — admins filter the dashboard, lists and CSV exports by branch with one click.

---

## Quick reference

| | |
|---|---|
| **Live site** | https://meseta-coffee.netlify.app |
| **Admin** | https://meseta-coffee.netlify.app/admin |
| **Tech** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Supabase (Postgres, Auth, Row-Level Security), Netlify Functions (API routes) |
| **Payments** | Safepay (sandbox + production), cash on pickup / delivery |
| **Hosting** | Netlify |
| **Timezone** | Asia/Karachi (PKT) — all hours-of-operation logic converts before comparing |

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Local development](#local-development)
4. [Environment variables](#environment-variables)
5. [Multi-branch](#multi-branch)
6. [Database (Supabase)](#database-supabase)
7. [Bootstrap admin user](#bootstrap-admin-user)
8. [Safepay (card payments)](#safepay-card-payments)
9. [Architecture & key concepts](#architecture--key-concepts)
10. [Project structure](#project-structure)
11. [Common admin workflows](#common-admin-workflows)
12. [Customising](#customising)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## Features

### Public site

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Hero with animated coffee cup, store status badge, live order count, brewing-process animation, featured menu, brewing ticker, reviews, Instagram tease, location |
| `/menu` | Full menu | Live search with category filter, 18+ items in 6 categories, click-through to product detail |
| `/menu/[slug]` | Product detail | Image, description, price, add-to-cart, related items |
| `/about` | Our story | Brand timeline, values |
| `/gallery` | Photos | Masonry grid with safe-image fallbacks |
| `/reviews` | All reviews | 27+ reviews from Google, Foodpanda, Instagram, Facebook, Tripadvisor + customer review form |
| `/contact` | Contact | Channel cards (call, WhatsApp, email, walk-in), opening hours, contact form |
| `/reservations` | Book a table | Date/time, people, notes |
| `/checkout` | Cart checkout | Customer info → fulfilment (pickup/delivery) → payment (card/cash) → submit |
| `/checkout/success` | Confirmation | Fulfilment-aware copy, order number, print-friendly receipt, WhatsApp deep link |
| `/checkout/cancel` | Cancelled | Friendly "no charge made, try again" page |

**Cart + ordering**
- Cart context with localStorage persistence; floating FAB; slide-in drawer with quantity controls.
- Server-side re-pricing on every checkout (no client-side tampering possible).
- **Card payments via Safepay** (sandbox + production); **cash on pickup / cash on delivery** label is fulfilment-aware.
- Live store-status guard: checkout is blocked when the store is closed (manual switch OR outside published hours).

**Multi-branch picker**
- First-time customer reaching `/menu`, `/menu/[slug]`, `/checkout` or `/reservations` is prompted: "Which Meseta are you ordering from?" — modal with one card per branch (name, address, Google rating + review count).
- Choice persists in localStorage; navbar chip + mobile-menu chip reopen the picker on demand.
- A `BranchBanner` at the top of `/menu` and each item page confirms which outlet the order will go to.
- Server validates the claimed `branch_id` against the active `branches` table at every `/api/checkout` and `/api/reservations` call — invalid or missing falls back silently to the main branch.

**Static + dynamic content**
- Static seed data (`src/lib/data/*.ts`) for menu, reviews, gallery — instant rendering, zero-database fallback.
- Supabase override: when the DB has rows, the site reads from there. Falls back to seed on read errors.

### Admin dashboard (`/admin`)

Authenticated area for café staff. Protected by Supabase Auth + an `admin_users` membership check.

| Section | What it does |
|---|---|
| **Dashboard** | KPI cards (revenue today, AOV, queue size, active menu items), **branch filter chips** that re-scope every KPI + 14-day chart + top items + recent orders, busyness pill, attention-needed inbox |
| **Revenue** | Range tabs (Today / Yesterday / 7d / 30d / Month / All / Custom), per-day bar chart |
| **Orders** | Filter by status, search by number/name/phone, **branch filter chips**, branch shown under each order, click into detail (branch shown in eyebrow). Quick **Call / WhatsApp customer** buttons |
| **Reservations** | Filter + search + status chips (pending → confirmed / seated / cancelled / no-show), **branch filter chips**, branch shown under each customer name |
| **Menu** | CRUD, bulk enable/disable, sort order, prices, images, tags |
| **Deals** | Scheduled promotions (% / fixed, whole-menu / category / single item) |
| **Coupons** | Discount codes with min spend, expiry, max-uses, redemption counter |
| **Messages** | Contact-form inbox |
| **Reviews** | Website reviews (admin-approved) + external reviews — split into two columns |
| **Store status** | One-click open/close toggle with custom closed-message + live preview |
| **Busyness** | Three-level pacing (Normal × 1 / Busy × 2 / Super busy × 3) + per-stage base minutes; drives auto-advance of the order state machine |
| **Announcement** | Site-wide gold banner — type a message and it appears at the top of every public page |
| **Settings** | Hours per day (24-hour inputs), contact channels, social links, payment-method toggles, closed-store message |

**Always-visible controls** (in the topbar):
- Status pill — green "Open" links to `/admin/store-status`; red "Closed" opens a reopen-confirmation modal that flips the switch with one click.
- Sign-out button.

---

## Tech stack

- **Framework** — Next.js 14 (App Router) + React 18 + TypeScript (strict).
- **Styling** — Tailwind CSS with a custom theme (`coffee`, `cream`, `gold`, `matcha`) and custom keyframes for the hero cup, beans, latte art, marquee, badge glow.
- **Database / Auth** — Supabase Postgres with Row-Level Security policies. Auth via Supabase's email/password.
- **Server actions** — for admin form submits (Next.js App Router native).
- **Payments** — Safepay v1 (Pakistan). HMAC-verified webhook.
- **Animation** — IntersectionObserver-driven scroll reveals, `requestAnimationFrame`-throttled parallax (no scroll-event listeners), pure-SVG cup + latte art, CSS keyframes for the rest.
- **Loader** — `<CoffeeLoader>` with anti-flash delayed fade-in (only appears on slow loads).
- **Deploy** — Netlify (with `loading.tsx` route-level Suspense fallbacks).

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in credentials
cp .env.example .env.local
# Edit .env.local with your Supabase + Safepay keys (see next section)

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

**Other scripts:**

```bash
npm run build       # production build
npm run start       # serve the production build
npx tsc --noEmit    # type-check only
npm run lint        # eslint
```

---

## Environment variables

`.env.local` (never commit this file):

```bash
# ── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # public, browser-safe
SUPABASE_SERVICE_ROLE_KEY=eyJ...                  # SERVER-ONLY (never expose)

# ── Public site ─────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # for OG / sitemap / Safepay redirects

# ── Admin session ───────────────────────────────────────────
ADMIN_SESSION_SECRET=<random-32-byte-base64>      # required, sign cookies

# ── Safepay (card payments, Pakistan) ───────────────────────
SAFEPAY_ENVIRONMENT=sandbox                       # sandbox | production
SAFEPAY_API_KEY=sec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx  # "client key" in dashboard
SAFEPAY_V1_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx      # "merchant secret"
SAFEPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxx    # signing secret for webhook events
```

`SAFEPAY_V1_SECRET` and `SAFEPAY_API_SECRET` are accepted interchangeably. Same for `SAFEPAY_ENVIRONMENT` and `SAFEPAY_ENV`.

Without Safepay credentials the site still functions — the card option in checkout returns a friendly *"Card payments are not configured yet, please choose cash on pickup."*

---

## Multi-branch

Meseta runs two physical outlets, both in Rawalpindi:

| Branch | Address | Google | Role |
|---|---|---|---|
| **Phase 4** (main / flagship) | The Riviera, Street 41-A, Phase 4 Bahria Town | 4.5★ · 1,072+ reviews | `is_main = true` |
| **DHA-1** | Sector F, DHA Phase 1 | 4.3★ · 222 reviews | newer outlet |

Both are seeded into the `branches` table by [migration 008](supabase/migrations/008_branches.sql).

### Customer side

- Visitor lands on `/`, `/about`, `/gallery`, `/reviews`, `/contact` — the picker stays quiet so the brand story is uninterrupted.
- The moment the visitor reaches an order-intent route (`/menu`, `/menu/[slug]`, `/checkout`, `/reservations`) the picker modal opens — *if* they have not chosen yet.
- Choice persists in `localStorage` (`meseta.branch.id.v1`).
- A persistent **branch chip** in the navbar (desktop) and at the top of the mobile menu re-opens the picker on demand. Hidden on single-branch deployments.
- A `BranchBanner` card sits above the menu grid and on each item page: *"Ordering from Phase 4 ★ 4.5 · 1,072 — Switch branch"*.
- Checkout and reservation forms each show a "Ordering from / Reserving at *X* [Switch]" trust chip.
- Order success page tells the customer *where* to pick up: *"Pickup at Phase 4 — The Riviera, Bahria Town."*

### Admin side

- **Dashboard** has a branch filter chip row at the top that re-scopes every KPI, the 14-day chart, the recent-orders list and the top-items list to a single branch. "View all" deep-links forward the active branch filter.
- **Orders** and **Reservations** lists have the same branch filter chip row. Branch is shown under each row, included as a column in the CSV export, and shown in the eyebrow of the order detail page.
- All CSV exports respect the active branch filter.

### Server guarantees

- `/api/checkout` and `/api/reservations` never trust the client's claimed `branch_id`. Both validate it against the active `branches` table; an invalid or missing id silently falls back to the main branch. A malicious client cannot tag an order with a branch that does not exist or has been deactivated.
- Every insert that adds `branch_id` is wrapped in a "retry without the column" fallback, so even pre-migration environments keep accepting orders and reservations.
- `getActiveBranches()` returns `[]` on error instead of throwing — the site keeps rendering if the `branches` table is missing.

### Item availability hook (Phase 3 ready)

[`isItemAvailableAtBranch(slug, branchId, availability?)`](src/lib/data/branches-helpers.ts) is a pure helper that returns `true` in Phase 1 (shared menu). Phase 3 will pass a per-branch availability `Map<branchId, Set<slug>>` derived from a `branch_menu_items` table, at which point every call site will start gating "add to cart" automatically — no UI changes needed.

### Adding a third branch

```sql
insert into public.branches (slug, name, short_name, address_line1, city, sort_order, is_main)
values
  ('gulberg', 'Meseta Coffee — Gulberg', 'Gulberg', 'MM Alam Road', 'Lahore', 3, false);
```

That one row is enough — the picker, the navbar chip, the admin filters and the CSV exports all populate automatically.

---

## Database (Supabase)

### Create a project

1. Go to <https://supabase.com> → New project.
2. **Settings → API** → copy the **Project URL**, **anon public** key, and **service_role** key into `.env.local`.

### Apply migrations (in order)

Open the Supabase **SQL Editor** and paste each file's contents, in this order, clicking **Run** between each:

| # | File | Purpose |
|---|---|---|
| 001 | [`001_init.sql`](supabase/migrations/001_init.sql) | Initial schema — menu, categories, reviews, reservations, contact, gallery; seed data |
| 002 | [`002_reservation_ends_at.sql`](supabase/migrations/002_reservation_ends_at.sql) | Add `ends_at` to reservations |
| 003 | [`003_orders.sql`](supabase/migrations/003_orders.sql) | Orders table + RLS |
| 004 | [`004_admin.sql`](supabase/migrations/004_admin.sql) | `admin_users`, `store_settings` (singleton), `deals`, `coupons`, `is_admin()` helper, RLS for everything |
| 005 | [`005_website_reviews.sql`](supabase/migrations/005_website_reviews.sql) | Allow `source = 'website'` in reviews + public insert policy |
| 006 | [`006_store_status_until.sql`](supabase/migrations/006_store_status_until.sql) | (Legacy, optional) adds `closed_until` — the app no longer requires it |
| 007 | [`007_busyness.sql`](supabase/migrations/007_busyness.sql) | `store_settings.busyness_level` + `auto_progress_minutes`; `orders.auto_advance_at` + index |
| 008 | [`008_branches.sql`](supabase/migrations/008_branches.sql) | `branches` table (Phase 4 + DHA-1 seeded), nullable `branch_id` FK on `orders` + `reservations` with indexes, backfill existing rows to Phase 4, RLS (anon reads active branches only) |

### Tables created

| Table | Purpose | Public can |
|---|---|---|
| `menu_categories` | Drink/food categories | read |
| `menu_items` | Menu items (bestseller, signature, `is_disabled`, price, image, tags) | read |
| `reviews` | Google / Foodpanda / IG / website reviews | read (+ insert for website) |
| `reservations` | Table bookings — carries `branch_id` (FK → `branches`) | insert |
| `contact_messages` | Contact-form inbox | insert |
| `gallery_images` | Photo gallery | read |
| `orders` | Customer orders + Safepay tracker + `auto_advance_at` + `branch_id` (FK → `branches`) | insert (via service-role API only) |
| `admin_users` | Maps `auth.users` → admin role (owner/admin/staff) | — (admin only) |
| `store_settings` | Singleton: open/closed, hours, contact, banner, payment toggles, busyness | read |
| `deals` | Scheduled promotions | read active rows |
| `coupons` | Discount codes | read active rows |
| `branches` | Physical outlets — slug, name, address, contact, Google rating + review count, `is_main`, `is_active`, `sort_order` | read active rows |

**RLS pattern:**
- Reads use the **anon key** + RLS-allowed public policies.
- Public writes (contact, reservation, website review) use a service-role helper that strips fields and validates server-side.
- All admin writes use a server action that calls `requireAdmin()` first (validates the admin via Supabase Auth + `admin_users` row).

---

## Bootstrap admin user

After migration `004` is applied:

### 1. Create the Auth user

Supabase Dashboard → **Authentication → Users → Add user → Create new user**.
Tick **Auto Confirm User** so it's usable immediately. Recommended:

- Email: `webdev.muhammad@gmail.com`
- Password: `Meseta@1`

### 2. Add a matching row in `admin_users`

The id in `admin_users` MUST match the Auth user's id. Easiest — run this in the SQL Editor:

```sql
insert into public.admin_users (id, email, full_name, role)
select id, email, 'Muhammad', 'owner'
from auth.users
where email = 'webdev.muhammad@gmail.com'
on conflict (id) do nothing;
```

### 3. Sign in

Visit `/admin/login` → you should land on `/admin`. If you get bounced back to the login with *"This account is not registered as an admin"*, the `admin_users` row is missing — re-run step 2.

---

## Safepay (card payments)

1. Sign up at <https://getsafepay.com> → start in **Sandbox**.
2. **Settings → API keys** → copy **Client key** into `SAFEPAY_API_KEY` and **Merchant secret** into `SAFEPAY_V1_SECRET`.
3. **Settings → Webhooks** → add a webhook pointing at:
   - **Local**: expose `http://localhost:3000/api/safepay/webhook` via [ngrok](https://ngrok.com) or `cloudflared tunnel --url http://localhost:3000`.
   - **Production**: `https://your-domain/api/safepay/webhook`.
   Copy the signing secret into `SAFEPAY_WEBHOOK_SECRET`.
4. Test: `/menu` → add an item → cart drawer → **Checkout** → fill the form → **Debit / Credit card** → Safepay sandbox checkout (test card `4242 4242 4242 4242`, any future expiry, any CVC) → returns to `/checkout/success`. The webhook flips `payment_status = captured` and `status = accepted` on the order.

---

## Architecture & key concepts

### Route groups split the chrome

```
app/
├── layout.tsx           ← html / body / fonts only (minimal)
├── loading.tsx          ← anti-flash loader (root)
├── (site)/              ← public site
│   ├── layout.tsx       ← Navbar + Footer + Cart + StoreStatusProvider
│   ├── loading.tsx
│   └── ... pages
└── admin/               ← admin dashboard
    ├── layout.tsx       ← AdminSidebar + AdminTopBar (auth-gated)
    ├── loading.tsx
    └── ... pages
```

The two groups have **completely separate chrome** — `/admin` physically cannot inherit the public navbar/footer.

### Store status: 3-layer combined state

The "open/closed" badge on the hero and the order-blocking gates in checkout combine three sources of truth:

1. **Admin manual switch** (`store_settings.is_open`) — top-bar pill in admin or the Store status page.
2. **Published opening hours** (`store_settings.hours`) — evaluated against Asia/Karachi time, with **overnight handling** (a Monday window of 9 AM – 1 AM is still "open" at 00:30 Tuesday).
3. **Both formats supported** — `parseHour()` accepts both "9:00 AM" (seed) and "09:00" (admin form), `formatHour()` displays as "9:00 AM" everywhere.

**Effective open** = `adminOpen AND withinHours`.

Lives in [`src/lib/hours.ts`](src/lib/hours.ts) + [`src/lib/store-status/useLiveStoreStatus.ts`](src/lib/store-status/useLiveStoreStatus.ts). The provider [`StoreStatusProvider`](src/lib/store-status/StoreStatusProvider.tsx) carries the raw admin flag, the closed message, AND the current hours through to client components, so a single source of truth feeds every gate.

### Busyness — auto-advance order pipeline

Admin sets a busyness level (Normal × 1 / Busy × 2 / Super busy × 3) and three base minute values:

- `placed → accepted` (default 2 min)
- `accepted → preparing` (default 5 min)
- `preparing → ready` (default 5 min)

`ready → completed` and `→ cancelled` are **always manual**.

**Effective time at each transition** = base × multiplier.

**How auto-advance works** (no cron job needed):
- On order create (`/api/checkout`), `auto_advance_at` is set to `now + first-stage minutes`.
- Every time the admin opens `/admin/orders` or an order detail, `tickAutoAdvance()` runs first — it walks any order whose `auto_advance_at <= now` forward to the next status and resets the timer for the *next* stage.
- Updates are conditioned on `status = old_status` so concurrent admin clicks never get silently overwritten.

Logic lives in [`src/lib/admin/orders.ts`](src/lib/admin/orders.ts) and [`src/lib/admin/busyness-types.ts`](src/lib/admin/busyness-types.ts). UI in [`src/components/admin/BusynessForm.tsx`](src/components/admin/BusynessForm.tsx).

### Cart + checkout flow

```
AddToOrderButton → useCart().add → localStorage persistence
       │
       ▼
   CartFab pulse + CartDrawer slide-in
       │
       ▼
   /checkout → form → POST /api/checkout
       │
       ├── server re-prices cart from menu_items
       ├── refuses if store closed (admin OR after-hours)
       ├── refuses if cart is empty / no valid items
       ├── card → Safepay session → redirect to hosted checkout
       │            ↓
       │       /api/safepay/webhook (HMAC-verified)
       │            ↓
       │       payment_status=captured, status=accepted, auto_advance_at set
       │
       └── cash → straight to /checkout/success
                  ↓
        Fulfilment-aware confirmation page (printable)
```

### Stale service-worker purge

A foreign service worker registered by another project on `localhost:3000` (or a previous deploy on the same domain) can intercept Meseta's requests and serve stale assets. [`<PurgeServiceWorker>`](src/components/PurgeServiceWorker.tsx) — mounted in the root layout — unregisters any worker on the origin and clears its caches on every load. Triggers one self-reload if a worker was actively controlling the page.

### Honest UX (no false promises)

The success page used to say *"We will send a confirmation to your WhatsApp"* — but there's no SMS/WhatsApp send anywhere. That copy was a lie. The current page:
- Tells the customer what *actually* happens, fulfilment-aware (pickup vs delivery).
- Surfaces the order number with a **Save this** emphasis.
- Adds a **Print receipt** button (print-specific CSS strips shadows).
- Adds a **Message Meseta** WhatsApp link with the order number pre-filled (customer-initiated, not a promise).

---

## Project structure

```
meseta-coffee/
├── README.md
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── netlify.toml
├── public/                          # static assets
├── supabase/
│   └── migrations/                  # 001 → 008 SQL migrations
└── src/
    ├── middleware.ts                # Supabase auth-cookie refresh + x-pathname
    ├── app/
    │   ├── layout.tsx               # html/body, CleanPreviewUrl, ClickEffect, PurgeServiceWorker
    │   ├── loading.tsx              # root anti-flash route loader
    │   ├── (site)/                  # public site route group
    │   │   ├── layout.tsx           # Navbar, Footer, Cart, StoreStatusProvider
    │   │   ├── loading.tsx
    │   │   ├── page.tsx             # /
    │   │   ├── menu/page.tsx        # /menu
    │   │   ├── menu/[slug]/page.tsx # /menu/[slug]
    │   │   ├── about/page.tsx
    │   │   ├── gallery/page.tsx
    │   │   ├── reviews/page.tsx
    │   │   ├── contact/page.tsx
    │   │   ├── reservations/page.tsx
    │   │   ├── checkout/page.tsx
    │   │   ├── checkout/success/page.tsx
    │   │   └── checkout/cancel/page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx           # AdminUIProvider + Sidebar + TopBar (auth-gated)
    │   │   ├── loading.tsx
    │   │   ├── page.tsx             # dashboard
    │   │   ├── login/page.tsx
    │   │   ├── logout/route.ts
    │   │   ├── revenue/page.tsx
    │   │   ├── orders/page.tsx
    │   │   ├── orders/[number]/page.tsx
    │   │   ├── reservations/page.tsx
    │   │   ├── menu/page.tsx
    │   │   ├── menu/new/page.tsx
    │   │   ├── menu/[id]/page.tsx
    │   │   ├── deals/...
    │   │   ├── coupons/...
    │   │   ├── messages/page.tsx
    │   │   ├── reviews/page.tsx
    │   │   ├── store-status/page.tsx
    │   │   ├── busyness/page.tsx
    │   │   ├── announcement/page.tsx
    │   │   └── settings/page.tsx
    │   └── api/
    │       ├── contact/route.ts
    │       ├── reservations/route.ts
    │       ├── reviews/route.ts
    │       ├── checkout/route.ts
    │       └── safepay/webhook/route.ts
    ├── components/
    │   ├── Navbar.tsx, Footer.tsx, Hero.tsx, ...
    │   ├── PurgeServiceWorker.tsx, CleanPreviewUrl.tsx, ClickEffect.tsx
    │   ├── CoffeeLoader.tsx, RouteLoading.tsx
    │   ├── anim/                    # CoffeeCup, LatteArt, beans, AnimatedRating, LiveBrewing, StoreStatusBadge
    │   ├── branch/                  # BranchPicker (modal), BranchChip (navbar), BranchBanner (menu)
    │   ├── cart/                    # CartFab, CartDrawer, AddToOrderButton
    │   ├── checkout/                # PaymentMethodPicker
    │   └── admin/                   # AdminSidebar, AdminTopBar, AdminUIProvider, AdminToast,
    │                                # StoreStatusForm, BusynessForm, AnnouncementForm,
    │                                # MenuItemForm, DealForm, CouponForm, StatCard, PageHeading,
    │                                # LoginButton
    └── lib/
        ├── utils.ts
        ├── data/                    # site, menu, reviews, gallery (static seed + helpers)
        │   ├── branches.ts          # SERVER-only fetchers (getActiveBranches, getBranchBySlug, getMainBranch)
        │   └── branches-helpers.ts  # client-safe Branch type + branchShortAddress + isItemAvailableAtBranch
        ├── hours.ts                 # PKT clock + open/close + format/parse (12h + 24h)
        ├── supabase/
        │   ├── client.ts            # browser client
        │   └── server.ts            # server (anon) + service-role clients
        ├── store-status/
        │   ├── StoreStatusProvider.tsx
        │   └── useLiveStoreStatus.ts
        ├── branch/
        │   └── BranchProvider.tsx   # client context + localStorage persistence + useBranch()
        ├── cart/CartProvider.tsx
        ├── safepay/client.ts        # Safepay session init + webhook signature verify
        └── admin/
            ├── auth.ts              # getCurrentAdmin + requireAdmin
            ├── store.ts             # store_settings reads + updates
            ├── orders.ts            # admin order list/detail + state transitions + tickAutoAdvance
            ├── order-types.ts       # OrderStatus, STATUS_FLOW, AdminOrder (includes branch_id)
            ├── busyness.ts          # updateBusyness server action
            ├── busyness-types.ts    # BusynessLevel + multipliers + nextAutoAdvanceAt
            ├── deals.ts, coupons.ts
            ├── inbox.ts             # reservations, messages, reviews (ReservationRow has branch_id)
            └── menu.ts              # menu CRUD
```

---

## Common admin workflows

### Take an order off the menu temporarily

`/admin/menu` → toggle the item's switch off. Disappears from `/menu` and `/menu/[slug]` (returns 404). If it was in someone's cart, the checkout API drops it during server-side re-pricing.

### Run a flash sale this weekend

`/admin/deals` → New → percentage 20%, applies to `all`, set `starts_at` and `ends_at`, save. Live immediately.

### Issue a coupon code for an event

`/admin/coupons` → New → code `WELCOME10`, fixed PKR off, set `min_subtotal`, `max_uses`, `expires_at`. Coupon redemption is tracked per-use in the DB.

### Close the store on short notice

Top bar → click the green "Open" pill → land on `/admin/store-status` → toggle Close + add a reason ("ingredients restock") → Save. Public site instantly shows a red banner and checkout returns `503` with the message.

### Switch into busy mode for a rush

`/admin/busyness` → tap **Busy** (×2) → Save. New orders auto-advance through statuses at double the base time. Existing orders' next tick is recalculated.

### Run a site-wide promotion banner

`/admin/announcement` → type *"Free brownie with every cold brew this week!"* → Save. Gold banner at the top of every public page. Clear the field to hide it.

### Walk an order through the kitchen

`/admin/orders` → click an order → the right rail shows next-state buttons matching `STATUS_FLOW`. Customer name, phone, email and 1-tap Call / WhatsApp buttons are right there in the Customer card.

### See only Phase 4 (or only DHA-1) on the dashboard

`/admin` → top of the page → click the **Phase 4** or **DHA-1** chip → every KPI, the 14-day chart, the recent-orders list and the top-items list re-scope to that branch. The URL becomes `?branch=<id>` so the view is bookmarkable. Click **All branches** to clear.

The same chip row exists on `/admin/orders`, `/admin/reservations` and forwards through to the CSV exports — so "all the orders that hit DHA-1 last week" is a 3-click pull (Branch → Last 7 days → Export CSV).

---

## Customising

| Edit | File |
|---|---|
| Brand name, tagline, contact info, social links, default hours | [`src/lib/data/site.ts`](src/lib/data/site.ts) |
| Static menu seed | [`src/lib/data/menu.ts`](src/lib/data/menu.ts) |
| Static reviews seed | [`src/lib/data/reviews.ts`](src/lib/data/reviews.ts) |
| Static gallery seed | [`src/lib/data/gallery.ts`](src/lib/data/gallery.ts) |
| Theme colours (coffee / cream / gold / matcha) | [`tailwind.config.ts`](tailwind.config.ts) |
| Fonts (Inter + Playfair Display) | [`src/app/layout.tsx`](src/app/layout.tsx) |
| Hero illustration / animations | [`src/components/anim/`](src/components/anim) |
| Default auto-progress base minutes | [`src/lib/admin/busyness-types.ts`](src/lib/admin/busyness-types.ts) — but admin can override at runtime |

Anything seeded statically is **read from DB when present, falls back to seed when empty** — so live editing in the admin always wins.

---

## Deployment

### Netlify (current setup)

1. Push to GitHub.
2. Netlify → Import from GitHub → select the repo.
3. **Site settings → Environment variables** — add every variable from [Environment variables](#environment-variables).
4. Deploy.

`netlify.toml` configures the build command + the Next.js runtime adapter.

### Post-deploy checklist

- [ ] All 8 migrations applied (via Supabase SQL Editor).
- [ ] `branches` table seeded — confirm Phase 4 (`is_main = true`) and DHA-1 are both `is_active = true`.
- [ ] Bootstrap admin user created in Auth AND `admin_users`.
- [ ] Safepay webhook URL updated to production: `https://your-domain/api/safepay/webhook`.
- [ ] `NEXT_PUBLIC_SITE_URL` updated in Netlify env vars.
- [ ] `SAFEPAY_ENVIRONMENT=production` (when ready for real cards).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **`TypeError: Cannot read properties of undefined (reading 'call')` in `webpack.js`** | Stale Next.js dev cache after lots of file churn | Stop dev server → `Remove-Item -Recurse -Force .next` → `npm run dev` |
| **Login bounces back to `/admin/login`** | Auth user not in `admin_users` (or row id ≠ Auth user id) | Re-run the bootstrap SQL with `select id from auth.users where email = '...'` |
| **Login POST returns `200 OK (from service worker)` and never navigates** | Stale service worker from another project on the same origin | [`<PurgeServiceWorker>`](src/components/PurgeServiceWorker.tsx) handles it on next load. Immediate: DevTools → Application → Clear site data |
| **Admin saves but the public site doesn't reflect** | Page cache | `(site)/layout.tsx` is `force-dynamic` + all admin actions call `revalidatePath("/", "layout")`. If still stale, refresh hard once (Ctrl+Shift+R) |
| **`Could not find the 'closed_until' column in schema cache`** | Migration drift | The code uses `select("*")` defensively and doesn't write `closed_until` anymore. Safe to ignore — or apply migration `006` if you want the legacy column |
| **Store says "closed" but admin flag is on** | Outside published hours (`store_settings.hours`) OR DB hours not edited yet | Settings → Hours; remember admin form uses 24-hour ("09:00") format |
| **Orders aren't auto-advancing** | Migration 007 not applied yet, OR no admin has loaded `/admin/orders` since the timer elapsed | Apply migration 007. The tick runs lazily on admin reads |
| **Cart drawer's "Checkout" button is disabled** | Store closed (manual OR after-hours) | See "Store says closed" row |
| **Safepay sandbox redirect returns to wrong domain** | `NEXT_PUBLIC_SITE_URL` mismatch | Set it to the URL the browser is actually visiting |

---

## License

© Meseta Coffee. All rights reserved. This codebase was built as a bespoke website for the Meseta Coffee brand.
