# Kamran Cloth House

E-commerce website for **Kamran Cloth House**, a fabric retailer in Saddar, Peshawar. Mobile-first storefront with Cash-on-Delivery checkout, WhatsApp ordering, and a self-service admin panel.

**Catalogue:** Cotton · Kapra / Wash-n-Wear · Winter Fabric · Dulha Design · Coat & Waistcoat · Shawls — 6 categories, 55 products, 35 brands.

## Features

**Storefront**
- Home: hero carousel, category grid, seasonal highlight banner, brand carousel, bestsellers, tailoring panel
- Product pages with size/colour options, search, category and brand listings
- Cart + multi-item COD checkout (25 Pakistani cities), order confirmation on WhatsApp
- Content pages: Delivery, Returns, Privacy, Terms, FAQ, How to Order, Tailoring, Contact (with map)
- `/track` — customers look up their order by number and see its live status

**Admin panel** (`/admin`, PIN login)
- Products, categories, brands — full CRUD from a phone
- Hero carousel and seasonal banner editors
- Settings: contact details, social links, logo, announcement bar, Meta/TikTok pixel IDs
- Orders: status workflow (Placed → Confirmed → Dispatched → Delivered), item photos, WhatsApp update message, printable packing slip
- Image uploads go straight to Cloudinary, stored as WebP

**Infrastructure**
- Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS 4
- PostgreSQL (Neon) — local PGlite fallback when `NEON_DATABASE_URL` is unset
- Cloudinary image storage, ISR revalidation every 60s
- Meta + TikTok pixel hooks (inactive until IDs are set in admin)

## Getting Started

Requirements: Node.js 20+

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run db:migrate             # create tables
npm run db:seed                # seed categories, products, brands, banners, settings
npm run dev                    # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin` — PIN is the `ADMIN_PIN` value in `.env.local`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply `db/schema.sql` |
| `npm run db:seed` | (Re)seed catalogue and settings from `src/lib/data.ts` |
| `npm run db:verify` | Verify database contents against the brief |
| `npm run db:test` | Catalogue data tests |
| `npm run smoke:api` | 137-check end-to-end API/page test (stops any dev server first) |

## Environment

All variables are documented in [`.env.example`](./.env.example). Required for production:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PIN` | Admin login PIN |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie (≥16 random chars) |
| `NEON_DATABASE_URL` | PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Image uploads |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (og:image, sitemap, canonical tags) |

Secrets live only in `.env.local` (gitignored). Never commit them.

## Project Structure

```
src/
  app/            Pages and API routes (storefront, admin, checkout, track)
  components/     UI — admin, cart, checkout, home, layout, product
  lib/            Business logic: db access, validation, settings, hero, analytics
db/schema.sql     Database schema
scripts/          migrate, seed, verify, tests
docs/             Design system, database schema, tech stack, product sheet
public/           Static assets (logo, category and hero images)
```

## Data & Content Notes

- Seed data source of truth: `src/lib/data.ts` (categories, products, brands, prices). After the client takes over content via `/admin`, avoid re-running `db:seed` — it resets to the seeded baseline.
- Product photos and prices currently use seed placeholders; real values are maintained through the admin panel.

## Deployment

1. Push to GitHub and import the repository into Vercel.
2. Set the environment variables above in the Vercel project settings.
3. Attach the domain (`kamrancloth.pk`) in Vercel and point DNS accordingly.

## Documentation

- [`DEVELOPER.md`](./DEVELOPER.md) — architecture, data flow, conventions, testing, deployment notes
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) — Green & Gold palette, typography, component rules
- [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) — tables and data models
- [`docs/TECH_STACK.md`](./docs/TECH_STACK.md) — architecture decisions
- [`docs/client-product-list.csv`](./docs/client-product-list.csv) — original product sheet

---

**Store:** Main Tipu Sultan Road, Shafi Bazar, Bangash Market, Shop #1, Saddar Peshawar · +92 333 4764131 · Cash on Delivery across Pakistan
