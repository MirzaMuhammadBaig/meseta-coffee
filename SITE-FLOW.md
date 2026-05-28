# Meseta Coffee — Site Flow Diagrams

A complete pictorial walkthrough of the website for explaining to the client. Every block below is a self-contained **Mermaid** diagram. Open https://mermaid.live, paste **one block at a time** (the lines between the ```` ```mermaid ```` fences only — not the fences themselves), and the rendered diagram appears on the right.

Use the heading above each block as the title when you talk through it.

---

## Table of contents

1. [The big picture — public site + admin](#1-the-big-picture--public-site--admin)
2. [Customer order journey — step by step](#2-customer-order-journey--step-by-step)
3. [Reservation flow](#3-reservation-flow)
4. [What the admin can do](#4-what-the-admin-can-do)
5. [Deals + coupons lifecycle](#5-deals--coupons-lifecycle)
6. [Pricing engine — server is the authority](#6-pricing-engine--server-is-the-authority)
7. [How "Open / Closed" is decided](#7-how-open--closed-is-decided)
8. [Busyness — automatic order progression](#8-busyness--automatic-order-progression)
9. [Database tables and relationships](#9-database-tables-and-relationships)
10. [Hosting + deployment pipeline](#10-hosting--deployment-pipeline)

---

## 1. The big picture — public site + admin

Everything a visitor or the admin can reach, on one map. The public site is on the left; the admin dashboard is on the right.

```mermaid
flowchart TB
    Visitor((🧑 Visitor))

    subgraph Public["🌐 PUBLIC WEBSITE"]
        direction TB
        Home["🏠 Home<br/>hero · marquee · story<br/>featured · reviews · CTA"]
        Menu["📜 Menu<br/>search · filter by category"]
        Item["☕ Item detail<br/>image · description<br/>price · Add to cart"]
        DealsP["🏷️ Deals page<br/>active promotions"]
        Checkout["🛒 Checkout<br/>name · phone · address<br/>coupon · cash or card"]
        Success["✅ Order success<br/>receipt · WhatsApp"]
        Cancel["↩️ Order cancel"]
        Reserve["📅 Reservations<br/>date · time · party size"]
        About["👋 About / Story"]
        Gallery["📸 Gallery"]
        Reviews["⭐ Reviews · 25+ entries"]
        Contact["📞 Contact form"]
    end

    Visitor --> Home
    Home --> Menu
    Menu --> Item
    Item --> Checkout
    Menu --> Checkout
    Home --> DealsP
    DealsP --> Menu
    Home --> Reserve
    Checkout --> Success
    Checkout --> Cancel
    Home --> About
    Home --> Gallery
    Home --> Reviews
    Home --> Contact

    AdminUser((🧑‍🍳 Admin))

    subgraph Admin["🔒 ADMIN DASHBOARD"]
        direction TB
        Login["🔑 Login"]
        Dashboard["📊 Dashboard<br/>KPIs · busyness · recent orders"]

        OrdersAdm["📦 Orders"]
        OrdDet["📦 Order detail"]
        Resv["📅 Reservations"]
        RevReport["💰 Revenue"]
        MenuAdm["☕ Menu"]
        Deals["✨ Deals"]
        Coupons["🎟️ Coupons"]
        Rev["⭐ Reviews"]
        Msg["💬 Messages"]
        StoreSet["🏪 Store status"]
        Anncm["📢 Announcement"]
        Busy["🎚️ Busyness"]
        Settings["⚙️ Settings"]
    end

    AdminUser --> Login
    Login --> Dashboard
    Dashboard --> OrdersAdm
    OrdersAdm --> OrdDet
    Dashboard --> Resv
    Dashboard --> RevReport
    Dashboard --> MenuAdm
    Dashboard --> Deals
    Dashboard --> Coupons
    Dashboard --> Rev
    Dashboard --> Msg
    Dashboard --> StoreSet
    Dashboard --> Anncm
    Dashboard --> Busy
    Dashboard --> Settings

    Checkout -. saves to .-> DB[(🗄️ Supabase<br/>Postgres + RLS)]
    Reserve -. saves to .-> DB
    Contact -. saves to .-> DB
    OrdersAdm -. reads + writes .-> DB
    Coupons -. reads + writes .-> DB
    Deals -. reads + writes .-> DB
    StoreSet -. controls .-> DB
    DB -. powers banners + open chip on .-> Public
```

---

## 2. Customer order journey — step by step

Exactly what happens from the moment a visitor adds something to the cart to the moment the café is notified.

```mermaid
sequenceDiagram
    actor C as 🧑 Customer
    participant Web as 🌐 Website
    participant Cart as 🛒 Cart Drawer
    participant Preview as ⚙️ /api/cart/preview
    participant API as ⚙️ /api/checkout
    participant DB as 🗄️ Supabase
    participant Pay as 💳 Safepay
    participant Cafe as 🧑‍🍳 Café

    C->>Web: Browse menu, click "Add to cart"
    Web->>Cart: Save line item (also to localStorage)
    Cart-->>C: Drawer shows running total

    Cart->>Preview: POST items (+ coupon if any)
    Preview->>DB: Load active deals + coupon
    Preview-->>Cart: Per-line deal price · subtotal<br/>discount · total

    C->>Web: Open /checkout, fill details
    opt Has a code
        C->>Web: Type coupon code, click Apply
        Web->>Preview: Re-price with coupon
        Preview-->>Web: Shows discount or error reason
    end

    C->>Web: Click "Place order"
    Web->>API: POST /api/checkout

    Note over API,DB: Server is the authority — never trusts<br/>the client's claimed total

    API->>API: priceCart() — recompute from items
    opt Coupon present
        API->>DB: Re-validate coupon
    end
    API->>DB: INSERT orders row<br/>(subtotal, discount, coupon, total,<br/>per-line deal_id + original_price)
    opt Coupon present
        API->>DB: redeemCoupon() — optimistic UPDATE<br/>only if uses_count unchanged
    end

    alt 💳 Card payment
        API->>Pay: Create checkout session
        Pay-->>API: Hosted-checkout URL
        API-->>Web: Redirect to Safepay
        C->>Pay: Enter card on Safepay
        Pay-->>C: Redirect to /checkout/success
        Pay-->>API: Webhook (signed) marks paid
    else 💰 Cash on pickup
        API-->>Web: Redirect to /checkout/success
    end

    Web-->>C: Receipt · WhatsApp the café

    Note over DB,Cafe: New order appears in /admin/orders
    Cafe->>DB: Updates status (placed → accepted<br/>→ preparing → ready → completed)
```

---

## 3. Reservation flow

Booking a table is simpler than ordering: no payment, no cart, just a server-validated form.

```mermaid
sequenceDiagram
    actor G as 🧑 Guest
    participant Web as 🌐 /reservations
    participant API as ⚙️ /api/reservations
    participant DB as 🗄️ Supabase
    participant Cafe as 🧑‍🍳 Café

    G->>Web: Pick date · time · party size
    G->>Web: Fill name · phone · email · notes
    G->>Web: Submit

    Web->>API: POST reservation
    API->>API: Validate (PKT timezone,<br/>future date, party size 1–20)
    API->>DB: INSERT reservations row<br/>(status = "pending")
    API-->>Web: Confirmation panel

    Note over DB,Cafe: New reservation appears in /admin/reservations
    Cafe->>DB: Approve / Decline / Mark seated
    Cafe-->>G: Optional WhatsApp confirmation
```

---

## 4. What the admin can do

Every screen the admin can reach, grouped by purpose. Each leaf is one page in the dashboard.

```mermaid
flowchart LR
    Login["🔑 /admin/login"] --> Dash["📊 /admin<br/>Dashboard"]

    Dash --> Ops["🅰 Operations"]
    Ops --> Stats["KPIs by date range<br/>orders · revenue · pending · AOV"]
    Ops --> RevRep["💰 /admin/revenue<br/>by-day chart · CSV"]
    Ops --> OrdL["📦 /admin/orders<br/>filter: range · status · search<br/>summary chips · CSV export"]
    OrdL --> OrdDet["Order detail<br/>items · customer · timeline<br/>📞 Call · 💬 WhatsApp<br/>status controls"]
    Ops --> ResvL["📅 /admin/reservations<br/>filter: range · status<br/>approve · decline · seated · CSV"]

    Dash --> Cat["🅱 Catalog"]
    Cat --> MenuL["☕ /admin/menu<br/>items CRUD · category · image"]
    Cat --> DealL["✨ /admin/deals<br/>smart status<br/>active · scheduled · ended · paused<br/>orders touched · Rs saved · CSV"]
    DealL --> DealD["Deal detail<br/>stats · orders triggered<br/>per-row deal savings"]
    Cat --> CpnL["🎟️ /admin/coupons<br/>smart status<br/>active · exhausted · expired · inactive<br/>redemptions · Rs saved · CSV"]
    CpnL --> CpnD["Coupon detail<br/>stats · usage progress<br/>orders that used the code"]

    Dash --> Eng["🅲 Engagement"]
    Eng --> RvM["⭐ /admin/reviews"]
    Eng --> MsgIn["💬 /admin/messages"]

    Dash --> Cfg["🅳 Configuration"]
    Cfg --> StSet["🏪 /admin/store-status<br/>open / close · reason · reopen time"]
    Cfg --> AncF["📢 /admin/announcement<br/>top-of-site marketing strip"]
    Cfg --> BzyF["🎚️ /admin/busyness<br/>Normal ×1 / Busy ×2 / Super ×3<br/>auto-advance base minutes"]
    Cfg --> SetF["⚙️ /admin/settings<br/>password · profile"]
```

---

## 5. Deals + coupons lifecycle

How a marketing campaign goes from an idea in the admin head to a discount on a customer's order — and how every redemption flows back into the dashboard.

```mermaid
flowchart TB
    Admin([🧑‍🍳 Admin]) -->|creates| Coupon["🎟️ Coupon<br/>code · % or flat · value<br/>min subtotal · max uses · expires"]
    Admin -->|creates| Deal["✨ Deal<br/>title · % or flat · value<br/>applies to: all / category / item<br/>window · sort order"]

    Deal -->|"is_active AND in window"| DealsPage["🏷️ /deals + menu badges"]
    Deal -->|auto-applies| MenuItem["☕ Menu item price<br/>shows strike-through"]

    Customer([🧑 Customer]) -->|sees| DealsPage
    Customer -->|adds to cart| Cart["🛒 Cart drawer"]
    Cart --> Preview["⚙️ /api/cart/preview<br/>per-line deal price · subtotal"]

    Customer -->|types code| CouponInput["💬 Coupon field"]
    CouponInput --> Preview
    Preview -->|"{lines, discount, total}<br/>or error reason"| Cart

    Customer -->|places order| Checkout["⚙️ /api/checkout"]
    Checkout -->|re-prices server-side| Engine["pricing engine<br/>deal-then-coupon math"]
    Engine --> Coupon
    Engine --> Deal
    Checkout -->|"saves orders.items[]<br/>with deal_id + original_price"| Ord["📦 orders row"]
    Checkout -->|optimistic UPDATE| Redeem[("redeemCoupon<br/>WHERE uses_count = old<br/>race-safe")]
    Redeem -->|win| Ord
    Redeem -.->|lose| OrdNoDisc["📦 orders row<br/>coupon not applied"]

    Ord -.->|aggregated by| CpnStats["📊 Coupon analytics<br/>redemptions · Rs saved<br/>revenue · AOV · last used"]
    Ord -.->|aggregated by deal_id| DealStats["📊 Deal analytics<br/>orders touched · lines<br/>Rs saved · revenue"]
    CpnStats --> Admin
    DealStats --> Admin
```

---

## 6. Pricing engine — server is the authority

The same code (`src/lib/pricing.ts`) powers both the cart preview and the real checkout, so what the customer sees and what they pay are always equal — and the client can never inflate or skip a discount.

```mermaid
flowchart TB
    Items[/"🛒 Cart items<br/>[{slug, qty}, …]"/] --> Engine
    Code[/"🎟️ Coupon code<br/>(optional)"/] --> Engine

    Engine["⚙️ priceCart()"]:::engine
    Engine --> A["1 · Resolve each line<br/>load price from menu (DB)"]
    A --> B["2 · Apply best deal per line<br/>– category / item / all<br/>– pick the larger discount"]
    B --> C["3 · Sum subtotal (post-deal)"]
    C --> D{Coupon valid?<br/>active · in window<br/>min subtotal · uses left}
    D -->|yes| E["4 · Apply coupon to subtotal"]
    D -->|no / none| F["4 · Skip coupon"]
    E --> G["5 · Compute total"]
    F --> G

    G --> Out[/"PricedCart<br/>lines[] (with deal_id,<br/>original + final price)<br/>subtotal, discount, total,<br/>applied_coupon"/]

    Out --> Preview["📡 /api/cart/preview<br/>read-only · live preview"]
    Out --> Checkout["💳 /api/checkout<br/>persists + charges this total"]

    classDef engine fill:#fef3c7,stroke:#a16207,stroke-width:2px
```

---

## 7. How "Open / Closed" is decided

Three signals combine to decide whether the store accepts orders right now.

```mermaid
flowchart TB
    A[🔘 Admin manual switch<br/>store_settings.is_open] --> Combine
    B[📅 Published schedule<br/>weekly hours]:::sched --> Combine
    C[⏰ Pakistan clock<br/>Asia/Karachi now<br/>handles overnight windows]:::sched --> Combine

    Combine{"Effective<br/>store state"}

    Combine -->|"is_open = false"| X[🔴 manually_closed<br/>banner across site<br/>/api/checkout → 503]
    Combine -->|"is_open = true<br/>but outside hours"| Y[🟠 after_hours<br/>banner with next-open time]
    Combine -->|"is_open = true<br/>and within hours"| Z[🟢 OPEN<br/>orders accepted normally]

    X --> Live[📡 Navbar status chip<br/>re-checks on tab focus]
    Y --> Live
    Z --> Live

    classDef sched fill:#fef3c7,stroke:#a16207
```

---

## 8. Busyness — automatic order progression

The admin sets a busyness level (Normal / Busy / Super busy) which multiplies the auto-advance timers. New orders crawl forward through the pipeline by themselves; completion and cancellation are always manual. Advancement happens lazily on every list read, so there is no cron job to babysit.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> placed: Order placed
    placed --> accepted: ⏱ after t1 = base × multiplier<br/>(default 2 min)
    accepted --> preparing: ⏱ after t2 = base × multiplier<br/>(default 5 min)
    preparing --> ready: ⏱ after t3 = base × multiplier<br/>(default 5 min)
    ready --> completed: ✋ manual (café)

    placed --> cancelled: ✋ manual
    accepted --> cancelled: ✋ manual
    preparing --> cancelled: ✋ manual
    ready --> cancelled: ✋ manual

    completed --> [*]
    cancelled --> [*]

    note right of placed
        Multiplier set in
        /admin/busyness:
          Normal = ×1
          Busy = ×2
          Super busy = ×3
        Base minutes also editable.
    end note
```

---

## 9. Database tables and relationships

The Supabase schema. Each box is a table; arrows mark foreign keys / soft links.

```mermaid
erDiagram
    orders }o..o| coupons : "redeemed via coupon_code"
    orders }o..o{ deals : "items[].deal_id (jsonb soft link)"

    orders {
        uuid id PK
        text number
        text customer_name
        text customer_phone
        text customer_email
        text fulfilment
        text address
        jsonb items
        int subtotal_pkr
        int discount_pkr
        text coupon_code
        int total_pkr
        text payment_method
        text payment_status
        text status
        timestamptz status_changed_at
        text notes
        timestamptz created_at
    }

    coupons {
        uuid id PK
        text code UK
        text description
        text discount_type
        int discount_value
        int min_subtotal_pkr
        int max_uses
        int uses_count
        timestamptz expires_at
        boolean is_active
        timestamptz created_at
    }

    deals {
        uuid id PK
        text title
        text slug
        text description
        text image_url
        text discount_type
        int discount_value
        text applies_to
        text target_slug
        timestamptz starts_at
        timestamptz ends_at
        boolean is_active
        int sort_order
        timestamptz created_at
    }

    menu_items {
        uuid id PK
        text slug UK
        text name
        text category
        text description
        int price_pkr
        text image
        boolean bestseller
        boolean signature
        jsonb tags
    }

    reservations {
        uuid id PK
        text customer_name
        text customer_phone
        text customer_email
        date reservation_date
        time reservation_time
        int party_size
        text status
        text notes
        timestamptz created_at
    }

    reviews {
        uuid id PK
        text source
        text author_name
        int rating
        text body
        date reviewed_at
        boolean is_published
    }

    contact_messages {
        uuid id PK
        text name
        text email
        text message
        boolean handled
        timestamptz created_at
    }

    store_settings {
        int id PK
        boolean is_open
        text closed_reason
        timestamptz closed_until
        text announcement
        boolean announcement_visible
        text busyness_level
        jsonb auto_progress_minutes
    }
```

---

## 10. Hosting + deployment pipeline

What happens between a `git push` and the live site updating.

```mermaid
flowchart LR
    Dev([👨‍💻 Developer]) -->|git push to main| GH[🐙 GitHub repository]
    GH -->|webhook| Host[☁️ Vercel / Netlify<br/>build + deploy]
    Host --> CDN[🌍 Edge CDN<br/>global delivery]

    Visitor([🧑 Visitor]) -->|HTTPS| CDN
    AdminU([🧑‍🍳 Admin]) -->|HTTPS| CDN

    Host -. environment vars .-> Cfg[🔐 .env values<br/>Supabase URL + anon key<br/>service-role key (server only)<br/>Safepay keys · admin secrets]

    CDN <-->|server requests| Fns[⚙️ Server functions<br/>Next.js route handlers<br/>+ server actions]
    Fns -->|service-role key<br/>no-store fetch| SB[(🗄️ Supabase<br/>Postgres + RLS)]
    Fns -->|create checkout / redirect| SP[💳 Safepay<br/>hosted checkout]

    Visitor -.->|complete payment| SP
    SP -.->|signed webhook<br/>marks paid| Fns
    SP -.->|redirect back| CDN

    Visitor -. WhatsApp deep-link .-> WA[💬 WhatsApp<br/>café's number]
    AdminU -. order-detail WhatsApp button .-> WA
```

---

## How to present these to the client

1. **Open** https://mermaid.live in your browser.
2. **Open** this file (`SITE-FLOW.md`) in any text viewer.
3. For each section in turn:
   - Copy the lines between the ```` ```mermaid ```` and ```` ``` ```` fences.
   - Paste into the Mermaid Live editor's left panel.
   - The diagram renders instantly on the right.
   - Walk the client through it using the short paragraph above the block as your script.
4. Mermaid Live has an **Export → PNG / SVG** button if you want to save each diagram as an image for a slide deck.

> 💡 Tip — diagrams 1, 4, and 9 are the most impressive for a non-technical client. Lead with those, then drill into the order journey (diagram 2) and the deals/coupons flow (diagram 5) if they want to go deeper. Diagram 6 (pricing engine) is the one to use whenever the client asks "can a customer hack the price?" — the answer is no, and that picture shows why.
