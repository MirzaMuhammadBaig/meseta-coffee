# Operations, Automation & Maintenance

A forward-looking companion to [README.md](README.md). The README explains *what's built*; this doc covers *what to automate next, what to watch over time, what it will cost, and what could go wrong*.

> **Audience:** the café owner and whoever maintains the codebase (today: developer; tomorrow: ideally the café manager for content + a part-time developer for code).

---

## TL;DR

- The site is **stable and shippable today**. The biggest UX gap is that **nothing notifies the customer** when an order is placed or status changes — currently relies on staff manually messaging via WhatsApp.
- **Top three things to automate first** (highest ROI, lowest cost): customer email confirmations, daily admin digest, automated DB backups.
- **Minimum cost to keep running well in Year 1: ~Rs 35,000 (~$125/year)** — custom domain + Supabase paid tier when you outgrow free.
- **Full automation suite (email + WhatsApp + analytics + monitoring): ~Rs 250,000–350,000/year (~$900–$1,250).**

---

## Table of contents

1. [Automation roadmap](#1-automation-roadmap)
2. [Recurring maintenance — short term (weekly / monthly)](#2-recurring-maintenance--short-term)
3. [Strategic maintenance — long term (year 1+)](#3-strategic-maintenance--long-term)
4. [Services & integrations catalogue](#4-services--integrations-catalogue)
5. [Cost projections (3 tiers)](#5-cost-projections)
6. [Risks & contingencies](#6-risks--contingencies)
7. [Suggested implementation roadmap](#7-suggested-implementation-roadmap)

---

## 1. Automation roadmap

Each item is rated:
- **Impact** — how much friction it removes for staff or customer.
- **Effort** — engineering hours, rough.
- **Cost** — monthly running cost (PKR / USD).

### Tier A — high-value, low-effort (do first)

| # | What | Impact | Effort | Cost | How |
|---|---|---|---|---|---|
| A1 | **Customer email confirmation** when an order is placed (with order details + status link) | High | 4–6 hr | $0–20/mo | [Resend](https://resend.com) (3K free/mo) → wire into `/api/checkout` after order insert + on webhook capture |
| A2 | **Admin email alert** on new order / reservation / contact message | High | 2–3 hr | $0 | Same Resend setup; one template per event |
| A3 | **Daily KPI digest email** to the owner — today's revenue, order count, top item, attention-needed inbox | Medium-high | 3–4 hr | $0 | [Netlify Scheduled Function](https://docs.netlify.com/functions/scheduled-functions/) cron + Resend |
| A4 | **Automated database backups to external storage** (weekly Supabase → S3 / Cloudflare R2) | High (disaster recovery) | 2 hr | $0–5/mo | `pg_dump` in a Netlify scheduled fn, upload to R2 (free 10GB) |
| A5 | **Order auto-advance even with no admin online** | Medium | 1–2 hr | $0 | Netlify scheduled fn that hits `/api/admin/tick` every minute (no-op endpoint that runs `tickAutoAdvance()`) |
| A6 | **Uptime monitoring** with email/SMS alerts | High (reactive) | 30 min | $0 | [UptimeRobot](https://uptimerobot.com) — pings 5 critical URLs every 5 min, free |
| A7 | **Sentry error monitoring** | Medium-high | 1 hr | $0 | Sentry free tier (5K events/mo). Catches webhook failures, missing env vars |

### Tier B — high-value, more effort

| # | What | Impact | Effort | Cost | How |
|---|---|---|---|---|---|
| B1 | **WhatsApp confirmation send** (the page currently mentions it; right now it's manual) | High | 8–12 hr | $39/mo + per-msg | [Wati](https://wati.io) (WhatsApp Business API, Pakistan-friendly) OR Twilio. Need template approval from Meta |
| B2 | **Customer order-tracking page** (`/order/[number]`) without admin login, looked up by phone number + order # | High | 6–8 hr | $0 | New public route with rate-limited lookup; minor RLS change on `orders` for read-by-number-and-phone-suffix |
| B3 | **Receipt PDF emailed automatically** on successful payment | Medium | 4–6 hr | $0 | `@react-pdf/renderer` server-side render → attach to Resend email |
| B4 | **Lost-cart recovery email** (email customer who started checkout but didn't finish) | Medium | 6–8 hr | $0 | Requires capturing email at step 1 of checkout; scheduled fn checks abandoned-cart timestamps |
| B5 | **Google Places reviews sync** (live, not seeded) | Medium | 6–8 hr | $0 (free tier) | Google Places Details API; cache 1×/day via scheduled fn; fall back to seed on quota hit |
| B6 | **Google Calendar sync for reservations** | Medium (less manual checking) | 8 hr | $0 | Google Calendar API; admin connects their account once via OAuth |
| B7 | **Image CDN** (Cloudinary or Supabase Storage) for menu / gallery upload from admin | Medium | 10–12 hr | $0–10/mo | Cloudinary free tier (25 credits/mo). Admin uploads → CDN URL stored in DB |
| B8 | **Stock tracking** — decrement `menu_items.stock` on order, alert when < threshold | Medium (depends on workflow) | 6–8 hr | $0 | DB trigger or server-action; needs admin to set initial stock + reorder threshold |

### Tier C — nice-to-have (defer unless growth demands)

| # | What | Cost / month |
|---|---|---|
| C1 | Loyalty program (points per order, redemption codes) | $0 (build in-house) or $20+/mo (Smile.io) |
| C2 | A/B testing platform (test menu prices, hero copy) | $0 (custom) or $20+/mo (Vercel Edge Config / GrowthBook) |
| C3 | Live chat widget (Crisp / Intercom) | $0–25/mo |
| C4 | Customer accounts (saved addresses, order history) | $0 (Supabase Auth) — significant code change |
| C5 | Multi-language (Urdu/English toggle) | $0 — `next-intl` integration, 1 week of work |
| C6 | Native PWA install prompt (offline menu cache) | $0 — `next-pwa`, 2–3 days |
| C7 | POS integration (when café gets a POS system) | Depends on POS API |
| C8 | Driver app / delivery tracking | Significant — only build if delivery volume justifies |
| C9 | Marketing automation (Mailchimp / Klaviyo) | $13–50/mo + setup |

---

## 2. Recurring maintenance — short term

### Weekly (5–10 minutes)

- **Check `/admin` dashboard** — anything stuck in the queue? Any unread messages?
- **Scan recent reviews** in `/admin/reviews` for anything inappropriate.
- **Reconcile Safepay dashboard** — confirm captured payments match the orders table.
- **Verify announcement banner** is still relevant (or clear it).
- **Glance at Supabase dashboard** — any RLS errors? Slow queries?

### Monthly (30 minutes)

- **Menu refresh** — seasonal items, price updates (PKR can fluctuate), re-photograph any bestsellers.
- **Run `npm outdated`** in the repo. Update minor + patch versions:
  ```powershell
  npm outdated
  npm update            # safe (semver-respecting) updates
  npx tsc --noEmit      # confirm types still pass
  npm run build         # confirm it builds
  ```
- **Check broken images** — Unsplash URLs occasionally 404. The site falls back to `FALLBACK_MENU_IMAGE`, but if many fail, swap to a CDN-hosted set or your own photos.
- **Verify backups** — if A4 (auto-backups) isn't set up yet, manually download a Supabase DB dump.
- **Review Stripe/Safepay statement** — check fees, disputes, refunds.
- **Skim Google Search Console** (once domain has been around 2+ months) — index coverage, top queries, click-through rate.

### Quarterly (1–2 hours)

- **Hero photo refresh** — winter/summer/event seasonal swaps.
- **Audit reviews data** — promote the best new ones to "featured" via the admin.
- **Audit menu** — anything always disabled / never ordered? Remove.
- **Refresh `site.ts` static copy** — stats (review count, IG followers), tagline, anything else.
- **Security**:
  - Rotate `ADMIN_SESSION_SECRET`.
  - Re-check that `.env.local` is in `.gitignore` (it is).
  - Run `npm audit` and patch any **high/critical** vulnerabilities.

### Yearly

- **Domain renewal** — set auto-renew to avoid expiry.
- **SSL certificate** — Netlify auto-renews Let's Encrypt; verify in dashboard.
- **Full backup test** — restore a Supabase dump to a fresh project and verify completeness.
- **Compliance review** — privacy policy / terms of service up to date? Cookie banner needed for any new tracking?

---

## 3. Strategic maintenance — long term

### Year 1 (data growth + ops scale)

- **Supabase free tier limit is 500 MB DB + 1 GB egress + 50K monthly Auth users.** At ~1,000 orders/month, the `orders` table will be ~5–10 MB/year, comfortably free. Image storage in Supabase Storage is the more likely tipping point.
- **Plan to upgrade to Supabase Pro** ($25/mo) when:
  - You add WhatsApp / email integrations (more service-role API traffic).
  - You exceed 500 MB DB (~ 2-3 years at current pace).
  - You want point-in-time recovery (Pro feature).
- **Netlify Pro** ($19/mo per member) only matters if you add team members OR you need band-width beyond 100 GB/month (large traffic spike).
- **Customer growth** — if delivery volume grows past ~20/day, build a driver-coordination layer (Tier B / C item).

### Year 2–3 (scale + brand maturity)

- **Multi-location support** — refactor `store_settings` to a `locations` table with per-location hours, menu availability, contact, etc. ~2 weeks of work; do this BEFORE opening a second café.
- **Loyalty program** — points-per-order with redemption codes; either home-built (4 weeks) or 3rd-party.
- **SEO maturity** — by year 2 you should rank for `"meseta coffee bahria town"`, `"bahria town coffee"`, `"specialty coffee rawalpindi"`. If not, audit metadata, internal linking, and build local citations (Google Business Profile, Foursquare, foodpanda merchant page).
- **Mobile presence** — install-prompt PWA covers 80% of need. Native iOS/Android only if traffic justifies (very rare for a single café).
- **Data analytics layer** — once order count > 5K, set up a simple BI tool (Metabase free + Supabase read-replica) so the owner can self-serve answers like *"which day of the week is busiest, by month?"*.

### Year 3+ (sustainability)

- **Codebase health** — Next.js will be on v16/17 by then. Plan a "major dep upgrade" sprint every 12–18 months (~3–5 days).
- **Domain authority + brand** — by now your reviews, IG, and search rank should be self-reinforcing. Maintenance is content + ops, not engineering.
- **Sustainability plan** — who maintains the codebase if the original developer is unavailable? Document:
  - Where credentials live.
  - How to redeploy from scratch.
  - The README + this doc serve as the handover.

---

## 4. Services & integrations catalogue

### Already integrated

| Service | What for | Tier | Cost |
|---|---|---|---|
| **Supabase** | Postgres + Auth + RLS | Free / Pro | $0 / $25/mo |
| **Netlify** | Hosting + serverless | Starter / Pro | $0 / $19/mo |
| **Safepay** | Card payments (Pakistan) | Pay-per-transaction | ~2.75% + Rs 25 per txn |
| **Unsplash** | Stock photos (menu fallbacks) | Free | $0 |
| **Google Fonts** | Inter + Playfair Display | Free | $0 |

### Recommended additions (short-term)

| Service | What for | Tier | Cost | Notes |
|---|---|---|---|---|
| **Custom domain** | `mesetacoffee.com` instead of `meseta-coffee.netlify.app` | One-time + yearly | Rs 3,000–5,000/yr (~$10–18) | Buy via Namecheap or Cloudflare; point DNS to Netlify |
| **Resend** | Transactional email (order confirmation, admin alerts) | Free / Pro | $0 (3K/mo) / $20 (50K/mo) | Verify domain for sending |
| **UptimeRobot** | Uptime + downtime alerts (email/SMS) | Free | $0 | Monitor 5 URLs every 5 min |
| **Sentry** | JS error + server error tracking | Developer free | $0 (5K errors/mo) | Catches webhook failures, runtime errors |
| **Plausible** OR **Google Analytics** | Site analytics | Plausible $9/mo OR GA $0 | $0–9/mo | Plausible is cookieless, privacy-friendly, no banner needed |

### Recommended additions (mid-term)

| Service | What for | Tier | Cost |
|---|---|---|---|
| **Wati** OR **Twilio WhatsApp** | WhatsApp Business API (real automated confirmations) | Pro | Rs 11,000/mo ($39) + per-message |
| **Cloudinary** | Image CDN + on-the-fly transforms (admin uploads) | Free | $0 (25 credits/mo) |
| **Cloudflare R2** | DB backup storage (off-Supabase) | Free | $0 (10 GB) |
| **Google Search Console** | SEO monitoring | Free | $0 |

### Recommended additions (long-term, only if growth justifies)

| Service | What for | Cost |
|---|---|---|
| **Mailchimp** / **Klaviyo** | Email marketing automation (newsletters, segments, drip campaigns) | $13–50/mo |
| **Crisp** / **Intercom** | Live chat widget | $0–25/mo |
| **Smile.io** / **Yotpo** | Loyalty platform | $20+/mo |
| **Metabase** (self-hosted) / **Mode** | BI dashboards | $0 self-hosted / $349+/mo |
| **Cloudflare** | DNS + edge caching + WAF (security) | $0–20/mo |

---

## 5. Cost projections

All in PKR, calculated at Rs 280 ≈ $1 (May 2026). Update annually.

### Tier 1 — Minimum (where you are today + custom domain + DB safety net)

| Item | Monthly | Yearly (PKR) |
|---|---|---|
| Domain | Rs 350/mo (amortised) | **Rs 4,200** |
| Supabase free tier | Rs 0 | Rs 0 |
| Netlify free tier | Rs 0 | Rs 0 |
| Resend free tier (3K/mo) | Rs 0 | Rs 0 |
| UptimeRobot free | Rs 0 | Rs 0 |
| Sentry free | Rs 0 | Rs 0 |
| Safepay (per-transaction, ~Rs 50 avg × 500 orders/mo = ~Rs 25,000/mo in fees) | Rs 25,000 | **Rs 300,000** |
| **Total** | **~Rs 25,350/mo** | **~Rs 304,200/yr** |

> Safepay fees scale with your revenue. If average order = Rs 1,500 and you do 500 orders/mo: revenue = Rs 750,000, Safepay takes ~3.3% (~Rs 25,000). This is your **biggest variable cost** and the only one tied to success.

### Tier 2 — Growth (adds email automation + analytics + paid Supabase)

| Item | Monthly | Yearly (PKR) |
|---|---|---|
| Tier 1 (excl. Safepay) | Rs 350 | Rs 4,200 |
| Supabase Pro | Rs 7,000 ($25) | **Rs 84,000** |
| Resend (50K emails/mo if you're sending order confirmations + digests) | Rs 5,600 ($20) | **Rs 67,200** |
| Plausible Analytics | Rs 2,520 ($9) | **Rs 30,240** |
| Safepay (same as Tier 1) | Rs 25,000 | Rs 300,000 |
| **Total** | **~Rs 40,470/mo** | **~Rs 485,640/yr** |

### Tier 3 — Premium (everything: WhatsApp automation + loyalty + live chat)

| Item | Monthly | Yearly (PKR) |
|---|---|---|
| Tier 2 (excl. Safepay) | Rs 15,470 | Rs 185,640 |
| Wati WhatsApp Business API | Rs 11,000 ($39) | **Rs 132,000** |
| WhatsApp template messages (~Rs 4 × 500 orders × 2 msgs each = Rs 4,000/mo) | Rs 4,000 | **Rs 48,000** |
| Cloudinary | Rs 0–2,800 ($0–10) | Rs 0–33,600 |
| Crisp live chat (Mini) | Rs 7,000 ($25) | Rs 84,000 |
| Loyalty (Smile.io Starter) | Rs 14,000 ($49) | Rs 168,000 |
| Safepay (same) | Rs 25,000 | Rs 300,000 |
| **Total** | **~Rs 76,470/mo** | **~Rs 917,640/yr** |

---

## 6. Risks & contingencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Supabase project deleted / DB lost** | Low | Critical | Auto backups (A4); Supabase Pro point-in-time recovery |
| **Netlify outage** | Low | High (site down) | Status page; static fallback CDN (Cloudflare in front) for read-only browsing; documented runbook to redeploy elsewhere |
| **Safepay account suspended / payment outage** | Low-medium | High (no card payments) | Cash on pickup stays available automatically (built-in). Keep one alternative gateway pre-registered (Easypaisa, JazzCash). Document the env-var swap |
| **Domain expired** | Low (if auto-renew on) | Critical | Auto-renew + a backup payment card on file with the registrar |
| **Developer unavailable** | Medium | Medium | README + this doc; minimum-viable handover. Consider quarterly check-in retainer |
| **Stale service worker hijacks site** | Already happened | Medium | Fixed via [`<PurgeServiceWorker>`](src/components/PurgeServiceWorker.tsx). Don't deploy other apps on the same localhost without service-worker hygiene |
| **Migration drift** (DB has columns the code doesn't expect, or vice versa) | Medium | Medium (silent breakage) | `getStoreSettings()` uses `select("*")` defensively. Always run migrations BEFORE deploying code that depends on them |
| **Inventory mismatch** (admin disables an item that's in someone's cart) | Medium | Low | `/api/checkout` re-prices server-side from `menu_items` and drops disabled items. Customer sees error, doesn't get charged |
| **DDoS / scraping** | Low | Medium | Cloudflare in front (~Rs 5,600/mo Pro plan adds rate limiting + WAF). Free tier is good defence. Most attacks bounce off Netlify's own protection |
| **Customer data leak via leaked service-role key** | Low | Critical | Key only in `.env.local` (gitignored); rotate annually; never logged; never sent to the client. If suspect compromise: Supabase Dashboard → Settings → API → Reset service role key |
| **Admin account compromised** | Medium | High | Use a strong unique password (Bitwarden / 1Password). Enable Supabase MFA (free). Rotate after every staff turnover. The admin user shown in this repo (`webdev.muhammad@gmail.com / Meseta@1`) MUST be replaced before production launch — that password is documented in conversation logs |

---

## 7. Suggested implementation roadmap

Based on impact-per-hour. Treat this as a starter — re-prioritise based on what the owner actually needs.

### Sprint 1 (week 1–2) — operational safety net

1. **A4 — Automated backups** (2 hr). Without this, every other concern is theoretical.
2. **A6 — UptimeRobot** (30 min). Know within 5 minutes if the site is down.
3. **A7 — Sentry** (1 hr). Know within seconds if checkout is throwing.
4. **Domain purchase + DNS migration** (1 hr + 24-hour propagation). Move off `*.netlify.app`.
5. **Replace bootstrap admin password** (5 min). The current credentials are in conversation logs.

**Cost: Rs ~4,000 (one-time domain) + Rs 0/mo running.**

### Sprint 2 (week 3–6) — customer experience

6. **A1 — Customer email confirmation** (4–6 hr). Closes the biggest UX gap.
7. **A2 — Admin email alerts** (2–3 hr). Owner doesn't need to babysit the dashboard.
8. **A3 — Daily KPI digest** (3–4 hr). Owner gets a morning email with yesterday's numbers.
9. **A5 — Auto-advance cron** (1–2 hr). Orders progress even when no admin is online.

**Cost: $0 (Resend free tier).**

### Sprint 3 (month 2–3) — growth enablers

10. **B5 — Live Google Places reviews sync** (6–8 hr). Reviews never go stale.
11. **B2 — Customer order-tracking page** (6–8 hr). Removes a class of "where's my order" WhatsApp pings.
12. **B3 — Receipt PDF emailed automatically** (4–6 hr). Customer keeps a copy.
13. **B7 — Image CDN + admin upload** (10–12 hr). Owner can update photos without a developer.

**Cost: ~Rs 7,000/mo (Supabase Pro recommended around here for the extra service-role traffic).**

### Sprint 4 (month 4+) — when growth justifies

14. **B1 — WhatsApp Business API** (8–12 hr + Meta template approval). Real automated confirmations (not the "we'll message you" lie).
15. **B8 — Stock tracking** (6–8 hr). Only valuable once a kitchen process is set.
16. **B4 — Lost-cart recovery emails** (6–8 hr). Reclaims ~5–10% of abandoned carts.

**Cost: ~Rs 16,000/mo (Wati + Supabase Pro).**

### Year 1 review

Re-evaluate Tier C items at the 12-month mark. Loyalty, A/B testing, multi-language only pay off if:
- Repeat customer rate > 30%.
- Order volume > 1,500/month.
- You have a clear customer-segment hypothesis to test.

---

## Appendix — handover quick reference

Where to find each piece of the puzzle, for the next person who picks this up:

| Need | Location |
|---|---|
| **Live URL** | https://meseta-coffee.netlify.app (will be your custom domain soon) |
| **GitHub repo** | The directory you're reading this from |
| **Supabase dashboard** | https://supabase.com/dashboard/project/ijqnaebtbwzlntroxiqj |
| **Safepay dashboard** | https://merchant.getsafepay.com |
| **Netlify dashboard** | https://app.netlify.com/sites/meseta-coffee |
| **All env vars** | `.env.local` (gitignored). To onboard a teammate: send via password manager, never email/Slack |
| **All credentials in one place** | Use [Bitwarden](https://bitwarden.com) / [1Password](https://1password.com) team vault — don't store in code |
| **Migrations** | `supabase/migrations/` (apply in order) |
| **Architecture doc** | [README.md](README.md) sections 7–8 |
| **This doc** | OPERATIONS.md (you are here) |

---

*Last updated: 2026-05-26. Re-review yearly.*
