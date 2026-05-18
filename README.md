# Meseta Coffee, meseta-coffee.com

A production-ready marketing & booking website for **Meseta Coffee** (Bahria Town Phase 4, Rawalpindi), built with **Next.js 14 (App Router)**, **Tailwind CSS** and **Supabase**.

> 4.5★ from 1,072+ Google reviews · 8K+ on Instagram · Specialty coffee, Turkish matcha, hand-pressed sandwiches.

---

## ✨ What's inside

- **Pages**
  - `/` : hero, story, bestsellers, eatertainment, live reviews, Instagram grid, map, CTA
  - `/menu` : full menu, 6 categories, bestseller / signature badges
  - `/about` : brand story, values, timeline
  - `/gallery` : masonry-style photo grid
  - `/reviews` : every Google / foodpanda / Instagram review on one page
  - `/contact` : channels + contact form
  - `/reservations` : table booking form
  - `/menu/[slug]` : statically generated product detail pages
  - `/checkout` : customer info + payment method picker + sticky order summary
  - `/checkout/success`, `/checkout/cancel` : post-payment screens
- **Cart + ordering**
  - localStorage-persisted cart context, floating FAB, slide-in drawer
  - **Card payments via Safepay** (sandbox + production), with cash-on-pickup as a fallback. Orders happen on-site — WhatsApp is reserved for support/contact, not checkout.
- **API routes** (all persist to Supabase)
  - `POST /api/contact` : saves to `contact_messages`
  - `POST /api/reservations` : saves to `reservations`
  - `POST /api/newsletter` : saves to `newsletter_subscribers`
  - `POST /api/checkout` : saves to `orders`, creates a Safepay session when paying by card
  - `POST /api/safepay/webhook` : receives Safepay payment events (HMAC-verified)
- **SEO** : per-page metadata, OpenGraph, sitemap (`/sitemap.xml`) and robots (`/robots.txt`)
- **Design** : custom Tailwind theme (coffee + cream + gold), Playfair Display + Inter, fully responsive, mobile menu

---

## 🚀 Quick start

```bash
# 1. Install deps
npm install

# 2. Copy env and fill in your Supabase keys
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open <http://localhost:3000>.

---

## 🔑 Environment variables

Drop these into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...           # public, browser-safe
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # SERVER ONLY, do not expose
NEXT_PUBLIC_SITE_URL=http://localhost:3000     # used for OG/sitemap
```

**Card payments via Safepay** (test mode works out of the box once you fill these):

```bash
SAFEPAY_ENV=sandbox                              # sandbox | production
SAFEPAY_API_KEY=sec_xxxxxxxxxxxxxxxxxxxx         # client key
SAFEPAY_API_SECRET=xxxxxxxxxxxxxxxxxxxx          # merchant secret
SAFEPAY_WEBHOOK_SECRET=                          # set after creating the webhook
```

Until those are filled in, the card option in checkout returns a friendly *"Card payments are not configured yet, please choose cash on pickup"* — so the rest of the flow keeps working.

Optional:

```bash
GOOGLE_PLACES_API_KEY=          # to sync live Google reviews
GOOGLE_PLACE_ID=
RESEND_API_KEY=                 # for email notifications
NOTIFY_EMAIL=hello@mesetacoffee.com
```

---

## 🗄️ Supabase setup

1. Create a project at <https://supabase.com>.
2. Settings → API → copy **Project URL**, **anon public** key and **service_role** key into `.env.local`.
3. Open the **SQL Editor** → paste each migration in order:
   - [`001_init.sql`](supabase/migrations/001_init.sql)
   - [`002_reservation_ends_at.sql`](supabase/migrations/002_reservation_ends_at.sql)
   - [`003_orders.sql`](supabase/migrations/003_orders.sql)
   - [`004_admin.sql`](supabase/migrations/004_admin.sql)
   Hit **Run** after each.

The migrations create the following tables (with sensible RLS):

| Table | Purpose | Public can |
| --- | --- | --- |
| `menu_categories` | Drink/food categories | read |
| `menu_items`      | Individual menu items (with bestseller / signature / `is_disabled` flags) | read |
| `reviews`         | Google / foodpanda / IG reviews | read |
| `reservations`    | Table booking requests | insert |
| `contact_messages` | Inbox for the contact form | insert |
| `newsletter_subscribers` | Email signups (unique) | insert |
| `gallery_images`  | Photo gallery | read |
| `orders`          | Customer orders + Safepay tracker | insert |
| `admin_users`     | Maps `auth.users` → admin role (owner/admin/staff) | — |
| `store_settings`  | Singleton: open/closed, hours, contact, banner, payment toggles | read |
| `deals`           | Scheduled promotions (whole-menu, category, or single-item) | read active |
| `coupons`         | Discount codes (percentage/fixed, min spend, expiry, uses) | read active |

Read access uses the **anon key** + RLS. The insert endpoints use the **service role key** server-side (never exposed to the browser).

---

## 💳 Safepay setup (card payments)

1. Sign up at <https://getsafepay.com> → **Sandbox** environment.
2. Settings → API keys → copy the **Client key** and **Merchant secret** into `.env.local` (`SAFEPAY_API_KEY`, `SAFEPAY_API_SECRET`).
3. Settings → Webhooks → add a webhook pointing at:
   - **Local**: use [ngrok](https://ngrok.com) or [cloudflared](https://github.com/cloudflare/cloudflared) to expose `http://localhost:3000/api/safepay/webhook`
   - **Production**: `https://<your-domain>/api/safepay/webhook`
   Copy the signing secret into `SAFEPAY_WEBHOOK_SECRET`.
4. Test the flow: go to `/menu`, add an item, open the cart, click **Checkout**, fill the form, pick **Debit / Credit card** → you'll be redirected to Safepay's sandbox checkout. Use their [test cards](https://docs.getsafepay.com/sandbox/test-cards) (`4242 4242 4242 4242`, any future expiry, any CVC).
5. After a successful test payment you'll land on `/checkout/success`, and the order in Supabase will have `payment_status = captured` (set by the webhook).

> 🛟 The whole site keeps working even without Safepay credentials — **Cash on pickup** stays available and orders still save to `orders`.

The migration also seeds the menu and a handful of real Google reviews so you have something to demo immediately.

---

## 🛠️ Admin dashboard

A full-featured operator dashboard lives at **`/admin`**: dashboard KPIs, orders, menu CRUD, deals, coupons, reservations, messages, reviews, newsletter, settings, and a one-tap store-close toggle.

### Create the bootstrap admin

1. Run migration `004_admin.sql` (above).
2. Supabase Dashboard → **Authentication → Users → Add user → Create new user**:
   - Email: **`webdev.muhammad@gmail.com`**
   - Password: **`Meseta@1`**
   - Tick **Auto Confirm Email** so it's usable immediately.
3. Back in SQL Editor, copy the new user's UUID (Users → click the row → **User ID**) and run:
   ```sql
   insert into public.admin_users (id, email, full_name, role)
   values (
     '<paste-uuid-here>',
     'webdev.muhammad@gmail.com',
     'Muhammad',
     'owner'
   );
   ```
4. Visit <http://localhost:3000/admin/login> and sign in with the credentials above.

### What you can do from the dashboard

| Section | What it does |
| --- | --- |
| **Dashboard** | Today's revenue, AOV, orders in queue, top items (14d), 14-day order trend, recent orders, attention-needed inbox |
| **Orders** | Filter by status/search, click any order to walk it through `placed → accepted → preparing → ready → completed` (or cancel) |
| **Menu** | Create / edit / delete items, bulk **Enable all** / **Disable all**, per-item disable, prices, images, tags, sort order, category |
| **Deals** | Schedule promotional offers (percentage / fixed PKR, whole menu / category / single item, start + end window) |
| **Coupons** | Discount codes with min spend, expiry, max-uses cap, redemption counter |
| **Reservations** | Confirm / mark seated / cancel / no-show, one tap |
| **Messages** | Contact-form inbox with read/handled toggle |
| **Reviews** | Toggle "Featured" to surface a review in the public carousel; delete |
| **Newsletter** | Subscriber list with one-click CSV export |
| **Settings** | Hours per day, contact channels, social links, payment-method toggles, announcement banner, closed-store message |
| **Top bar pill** | Click "Store open" → confirm → entire public site shows a red banner with your message and **`/api/checkout` refuses to accept orders** |

### Live impact on the public site

- **Disable a menu item** → it disappears from `/menu` and `/menu/[slug]` (404). Already in someone's cart? The checkout API drops it during server-side re-pricing.
- **Close the store** → red banner across every page + checkout returns `503` with the custom message.
- **Disable card payments** (Settings) → only Cash on pickup remains; submitting card returns a friendly error.
- **Feature a review** → instantly visible in the home-page testimonials carousel.

---

## 📂 Project structure

```
meseta-coffee/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root + fonts + nav/footer
│   │   ├── page.tsx                # home
│   │   ├── globals.css             # tailwind + theme tokens
│   │   ├── menu/page.tsx
│   │   ├── about/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── reservations/page.tsx
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── api/
│   │       ├── contact/route.ts
│   │       ├── reservations/route.ts
│   │       └── newsletter/route.ts
│   ├── components/                 # Navbar, Hero, Story, FeaturedItems, ...
│   └── lib/
│       ├── utils.ts
│       ├── data/                   # static menu/reviews/site copy
│       └── supabase/
│           ├── client.ts           # browser client
│           └── server.ts           # server + service-role clients
├── supabase/
│   └── migrations/001_init.sql
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── .env.example
```

---

## 🎨 Customising the brand

- **Copy & contact info** : [`src/lib/data/site.ts`](src/lib/data/site.ts)
- **Menu items** : [`src/lib/data/menu.ts`](src/lib/data/menu.ts)
- **Reviews** : [`src/lib/data/reviews.ts`](src/lib/data/reviews.ts) (or wire to the `reviews` Supabase table)
- **Gallery** : [`src/lib/data/gallery.ts`](src/lib/data/gallery.ts) (or wire to the `gallery_images` Supabase table)
- **Colours / fonts** : [`tailwind.config.ts`](tailwind.config.ts) and [`src/app/layout.tsx`](src/app/layout.tsx)

> The current data layer reads from local TS files for instant rendering and demo-ability. The Supabase tables are ready for an admin dashboard. Swap the `import` to `createSupabaseServerClient().from(...)` whenever you want live editing.

---

## 🛳️ Deploy

The cleanest path is **Vercel**:

1. Push this repo to GitHub.
2. Import it on <https://vercel.com/new>.
3. Add the four env vars from the section above.
4. Deploy.

---

## 📝 License

© Meseta Coffee. All rights reserved. This codebase was built as a bespoke website for the Meseta Coffee brand.
