# Developer Guide

Technical reference for working on the Kamran Cloth House storefront and admin panel.

## 1. Overview

A production e-commerce site for a fabric retailer in Peshawar:

- **Storefront** — browse, search, cart, Cash-on-Delivery checkout, WhatsApp ordering, order-status lookup.
- **Admin panel** (`/admin`) — full content management (catalogue, banners, settings) and order fulfilment.
- **Stack** — Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, PostgreSQL (Neon), Cloudinary.

## 2. Architecture

```
Browser
  └─ src/app/**            Pages (RSC) + route handlers (src/app/api/**)
       └─ src/lib/db/**    Data access — the only layer that writes SQL
            └─ driver      Neon serverless driver; local PGlite fallback
```

- Server components read through `src/lib/db/*` on every request (`force-dynamic`) or with ISR (`revalidate = 60` on the home page).
- Validation lives beside its domain: `src/lib/admin/validate-*.ts`, `validateOrderInput` in `src/lib/db/orders.ts`.
- Client components handle interactivity only (cart, checkout, admin editors); they call the API routes, never the database.

## 3. Local Development

```bash
npm install
cp .env.example .env.local    # fill in values
npm run db:migrate
npm run db:seed
npm run dev                   # http://localhost:3000
```

If `NEON_DATABASE_URL` is unset, the app falls back to a local PGlite database in `.data/` (development only — never in production).

Admin login: `/admin`, PIN from `ADMIN_PIN`. Sessions are HMAC-signed cookies (`ADMIN_SESSION_SECRET`).

## 4. Project Structure

```
src/app            Pages and API routes
  (storefront)     /, /product/[slug], /categories, /brands, /track, content pages
  admin            /admin/* — dashboard, products, categories, brands, banners, orders, settings
  api              Public: orders, search, categories — Admin: /api/admin/*
src/components     admin/, cart/, checkout/, home/, layout/, product/, ui/
src/lib            db/ (SQL), admin/ (validation, session), settings, hero, orders, analytics
db/schema.sql      Schema applied by scripts/migrate.ts
scripts/           migrate, seed, verify-db, test-catalogue, smoke-api
docs/              Design system, database schema, tech-stack rationale, product sheet
```

## 5. Database & Seed Data

- **Tables:** products, categories, brands, `product_categories` (many-to-many), banners (hero slides + seasonal promo), orders, store_settings (single row), order_number_seq.
- **Order items** are stored as JSONB with `slug, title, brand, color, quantity, price, image` — a snapshot at checkout time.
- **Seed source of truth:** `src/lib/data.ts`. `npm run db:seed` upserts catalogue and settings; after content is managed through `/admin`, do not re-run it casually — it resets seeded fields (banners, settings, taxonomy) to defaults.
- `npm run db:verify` / `npm run db:test` assert the catalogue against the product brief (derived from `data.ts`).

## 6. Admin Panel Notes

| Module | Route | Notes |
| --- | --- | --- |
| Products | `/admin/products` | Multi-step form; image uploads → Cloudinary; colour variants; “Also appears in” secondary categories |
| Categories / Brands | `/admin/categories`, `/admin/brands` | CRUD with sort order, featured/active flags |
| Banners | `/admin/banners` | Hero carousel slides + seasonal highlight banner (step 3) |
| Orders | `/admin/orders` | Status workflow, delivery address, item photos, WhatsApp update, printable slip |
| Settings | `/admin/settings` | Contact, socials, logo, announcement, pixels, delivery charges |

**Critical:** `PUT /api/admin/settings` replaces the **entire** settings row — always GET the current object, mutate the needed fields, then PUT. The same applies to `PUT /api/admin/home` (expects `{ slides: [...] }` or `{ promo: {...} }`).

Admin-facing UI copy is written in informal Hinglish (labels, hints, notifications); storefront copy is English.

## 7. Orders & Fulfilment

1. Customer checks out (COD) → `POST /api/orders` → order created as `pending`, number `KCH-1001…` from a sequence.
2. Admin confirms, then updates status: `pending → confirmed → dispatched → delivered` (or `cancelled`) via `/api/orders/[orderNumber]` PATCH.
3. “Send WhatsApp Update” opens a pre-filled message to the customer for the current status.
4. Customer checks status at `/track` (public GET, excludes name/phone/address).

There is no courier integration — statuses are set manually by the admin.

## 8. Media

- All admin uploads go through `POST /api/admin/upload` → Cloudinary (`kch-products` folder), converted to **WebP** (animated GIFs excepted), capped at 2000 px on the long side, ≤ 15 MB.
- Delivery uses `f_auto,q_auto`; `next/image` serves optimised variants.
- Recommended sizes: products 1200×1600, hero 1920×1080, seasonal banner 1920×800, category tiles 1600×1200, logos 600×200 transparent PNG.

## 9. Analytics

`src/lib/analytics.ts` + `src/components/analytics/PixelLoader.tsx` inject Meta (`fbq`) and TikTok (`ttq`) pixels from settings. Events: PageView (on load and route change), ViewContent (product page), AddToCart (checkout open), Purchase / CompletePayment (order accepted). Empty IDs in settings = disabled.

## 10. Testing

| Command | Covers |
| --- | --- |
| `npm run lint` | ESLint (0 errors) |
| `npx tsc --noEmit` | Type check |
| `npm run smoke:api` | 137 end-to-end checks: auth, CRUD, checkout, orders, settings, banners, storefront |
| `npm run db:verify` | Database vs product brief |
| `npm run db:test` | Catalogue data tests |

`smoke:api` boots its own server on port 3210 against a throwaway database (smoke: `NEON_DATABASE_URL` empty → PGlite) and **requires any running dev server to be stopped first** (Next.js allows one server per directory).

## 11. Deployment

- Platform: **Vercel** (free tier). Environment variables must be set in project settings (see `.env.example`) — `.env.local` never ships with the repository.
- Database: Neon (Postgres). Run `db:migrate` and `db:seed` once against production, then manage content via `/admin`.
- Domain: `kamrancloth.pk` — add in Vercel and point DNS (A/CNAME) accordingly.
- After admin changes, pages regenerate via ISR (≤ 60 s) or on-demand revalidation (`src/lib/admin/revalidate.ts`).

## 12. Conventions

- TypeScript strict; path alias `@/* → ./src/*`.
- Design tokens and component rules: `docs/DESIGN_SYSTEM.md` — use semantic utilities (`bg-brand`, `text-gold`, `text-ink`, `border-line`) over raw colours.
- Money in PKR integers; format via `Rs. ${n.toLocaleString()}`.
- Keep secrets out of the repo; never prefix database credentials with `NEXT_PUBLIC_`.
