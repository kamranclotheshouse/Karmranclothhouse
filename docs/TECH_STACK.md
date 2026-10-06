# 🛠️ Tech Stack & Architecture Decision

## Project: Kamran Cloth House

### 1. The Challenge & Requirements
- **Low Budget / Zero Monthly Cost:** Avoid recurrent subscriptions like Shopify ($39/month = ~11,000 PKR/mo) or expensive VPS hosting.
- **Extreme Speed for Ad Traffic:** Meta & TikTok video ad visitors bounce if page load exceeds 2 seconds.
- **Client Independence (Self-Management):** The client must effortlessly add/edit products, stock, prices, banners, and review orders from their mobile phone or laptop without writing a line of code.
- **Cash on Delivery (COD) Focus:** Seamless checkout tailored to Pakistani e-commerce behavior (no credit card barrier).
- **Pixel Perfection:** Native Meta & TikTok event tracking for profitable ad retargeting.

---

## 2. Recommended Tech Stack Comparison

| Factor | Option A: Shopify | Option B: WordPress / WooCommerce | Option C (Recommended): Next.js 16 + Neon |
| :--- | :--- | :--- | :--- |
| **Monthly Cost** | ~$39/mo + app fees (~12,000+ PKR/mo) | ~$5-10/mo hosting + maintenance | **0 PKR / month (Free tier forever)** |
| **Speed (Lighthouse)** | 60–75 (Heavy scripts) | 50–70 on cheap Pakistani hosting | **95–100 (Instant edge server rendering)** |
| **Mobile Ad Conversion** | Standard, rigid checkout | Clunky multi-step unless custom plugins | **1-Click WhatsApp & 1-Step COD Drawer** |
| **Admin Ease** | Great | Cluttered WordPress wp-admin | **Custom clean Urdu/English Mobile Portal** |
| **Custom Styling** | Limited to paid themes | Heavy PHP templates | **Bespoke Green & Gold Aesthetics** |
| **Tracking / Pixels** | Requires paid apps | Heavy plugins | **Native, zero-latency event dispatch** |

---

## 3. Selected Stack Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │          Visitors (Meta / TikTok Ads)        │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │    Next.js Frontend (Vercel Edge Network)    │
                    │   - Green & Gold Luxury UI                    │
                    │   - High Performance Image Optimization      │
                    │   - Meta & TikTok Pixel Tracking Hooks       │
                    └──────────────┬───────────────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
    ┌───────────────────────────┐       ┌───────────────────────────┐
    │     Client Storefront     │       │    Mobile-Friendly Admin  │
    │  - Products, Brands, Cats │       │  - Product / Stock CRUD   │
    │  - 1-Step COD Checkout    │       │  - Order Status & Slip    │
    │  - WhatsApp Direct Order  │       │  - Hero / Offer Manager   │
    └─────────────┬─────────────┘       └─────────────┬─────────────┘
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────────────────────┐
                    │   Neon Backend (Serverless PostgreSQL)       │
                    │  - Tables: products, brands, orders, etc.   │
                    │  - Region: ap-southeast-1 (closest to PK)   │
                    └──────────────┬───────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────────────────┐
                    │   Cloudinary (Media) + Order Dispatch        │
                    │  - Product image hosting & resizing          │
                    │  - WhatsApp Instant Message Generator        │
                    │  - COD Order Log with Status Updates         │
                    └──────────────────────────────────────────────┘
```

### Stack Components:
1. **Frontend Framework:** `Next.js 16` (App Router, Turbopack)
   - React Server Components (RSC) for maximum SEO and sub-second load times.
   - Dynamic routing for `/[brand]`, `/[category]`, `/product/[slug]`.
   - Static catalogue pages revalidate every 60s; admin edits invalidate them instantly.
2. **Styling & Design System:** `Tailwind CSS v4` + Custom CSS Variables
   - Custom palette (see `DESIGN_SYSTEM.md`): `--color-green: #0E3B2C`, `--color-green-deep: #0A2B20`, `--color-gold: #C9A227` (on green), `--color-gold-text: #7A5F0E` (on light), `--color-cream: #F5F0E6`, `--color-ink: #10231C`, `--color-border: rgb(211 206 197)`; semantic utilities `bg-brand`, `text-gold`, `bg-cream`, `text-ink`.
   - Lucide Icons (lightweight, razor-sharp).
3. **Database:** `Neon` — serverless PostgreSQL
   - Relational database for products, brands, categories, orders, banners and store settings.
   - Server-side only: the connection string never reaches the browser bundle.
   - Free tier: 0.5 GB storage, ~190 compute hours/month — far beyond a single shop.
4. **Media:** `Cloudinary`
   - CDN-cached image hosting with on-the-fly resizing and format conversion.
   - Signed uploads from the admin panel; no raw keys in the client.
5. **Auth:** Signed httpOnly cookie (`HMAC`) with a 4-digit admin PIN.
   - UI-level gate only — every admin API route re-verifies the cookie server-side.
6. **Hosting & Deployment:** `Vercel` (Hobby / Free Tier)
   - Automatic global CDN caching, SSL certificates, zero DevOps hassle.
   - **Note:** Vercel's Hobby terms are written for personal/non-commercial sites. Selling goods is commercial traffic. The client has accepted this risk for launch; moving to Pro ($20/mo) removes it.
7. **Analytics & Tracking:**
   - Meta Pixel (Facebook/Instagram)
   - TikTok Events Pixel
   - Google Analytics 4 (Optional)

---

## 4. Cost Breakdown (Budget Analysis)

| Service | Plan | Monthly Cost | Yearly Cost |
| :--- | :--- | :--- | :--- |
| **Vercel Hosting** | Hobby Tier (100 GB bandwidth, unlimited static requests) | $0 | $0 |
| **Neon Database** | Free Tier (0.5 GB storage, ~190 compute hrs/mo) | $0 | $0 |
| **Cloudinary** | Free Tier (25 credits/mo — covers thousands of image deliveries) | $0 | $0 |
| **Domain Name** | `.pk` via PKNIC (e.g. `kamrancloth.pk`) — CNIC required to register | — | **~2,100 PKR/yr** |
| **SSL Certificate** | Automatic via Vercel | $0 | $0 |
| **WhatsApp Direct Order** | Native `wa.me` URL schema with rich message template | $0 | $0 |
| **Total Recurring Cost** | | **0 PKR / month** | **~2,100 PKR/yr (domain only)** |

**Notes for handover**
- The only unavoidable recurring cost is the `.pk` domain, paid to PKNIC (renewable in 1- or 2-year terms; a CNIC is required to register or renew).
- Everything else stays free **as long as usage stays inside the free tiers** — 0.5 GB of database and 25 Cloudinary credits a month is many times what a single shop will use.
- Vercel Hobby is free but its terms do not permit commercial use (see §3.6). This is a known, accepted risk; Pro hosting would be $20/mo (~5,500 PKR/mo) if it ever needs to be regularised.
- Image storage and delivery are free on Cloudinary's free tier; upgrading is only needed if the catalogue grows past free-tier limits.

This guarantees the client gets a world-class, ultra-fast website without any recurring monthly software stress.
