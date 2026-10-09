# Kamran Cloth House — Project Guide

This document explains the production website, its admin panel, and the small amount of maintenance needed after handover.

## Production

- Storefront: https://www.kamranclothhouse.pk
- Admin panel: https://www.kamranclothhouse.pk/admin
- Primary domain: `www.kamranclothhouse.pk` (the non-www domain redirects to it)
- Repository: `https://github.com/kamranclotheshouse/Karmranclothhouse`
- Hosting: Vercel
- Database: Neon PostgreSQL
- Media: Cloudinary

## What is included

- Mobile-first storefront with six categories and 57 products.
- Product search, category/brand browsing, product pages and colour variants.
- Cart and Cash on Delivery checkout.
- WhatsApp ordering and order-status lookup at `/track`.
- Admin content management at `/admin` for products, brands, categories, homepage banners, settings and orders.
- Cloudinary image upload with WebP conversion.
- Meta and TikTok browser pixels configured from Admin → Settings.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

For a fresh local database, leave `NEON_DATABASE_URL` empty and run:

```bash
npm run db:migrate
npm run db:seed
```

Without `NEON_DATABASE_URL`, development uses a local PGlite database under `.data/`. Production must always use the Neon connection string.

## Environment variables

Set these in Vercel Project Settings → Environment Variables. Never commit real values.

| Variable | Purpose |
| --- | --- |
| `ADMIN_PIN` | PIN for `/admin` login |
| `ADMIN_SESSION_SECRET` | Signs admin session cookies; use a long random value |
| `NEON_DATABASE_URL` | Production PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary server secret |
| `NEXT_PUBLIC_SITE_URL` | `https://www.kamranclothhouse.pk` |

Meta and TikTok Pixel IDs are intentionally managed in Admin → Settings, not in the repository.

## Admin workflow

- Products: add/edit prices, stock, images, colours and categories.
- Categories and brands: edit names, descriptions, images and ordering.
- Homepage: edit hero slides and seasonal banner.
- Orders: confirm, dispatch, deliver, cancel or return orders; send WhatsApp updates and print slips.
- Settings: update contact details, delivery charges, social links, announcement text and tracking Pixel IDs.

Do not run `npm run db:seed` against the production database after the client starts managing content through the admin panel. Seeding restores catalogue/settings defaults and can overwrite managed content.

## Analytics

When IDs are saved in Admin → Settings, the storefront sends:

- `PageView` on initial load and client-side navigation.
- `ViewContent` on product pages.
- `AddToCart` when an item is added to the cart.
- `InitiateCheckout` when checkout opens.
- Meta `Purchase` and TikTok `CompletePayment` after an order is accepted.

Events can be checked in Meta Events Manager, TikTok Events Manager and the relevant browser helper extensions. Conversions API is optional; the browser Pixel setup is already active.

## Media guidance

Upload product images through the admin panel. They are stored in Cloudinary as WebP and delivered with automatic quality/format optimisation. Recommended product ratio is 3:4 (about 1200 × 1600 px); hero images are widescreen.

## Verification commands

```bash
npx tsc --noEmit
npm run lint
```

`npm run db:verify` and `npm run db:test` are development checks. Stop any running dev server before running the full API smoke test.

## Important maintenance notes

- Keep database and Cloudinary secrets server-side.
- Change the admin PIN and session secret when ownership changes.
- Use Vercel production deployments for live changes; GitHub `main` is connected to Vercel.
- Keep the client’s Google, GitHub, Vercel, Neon, Cloudinary, Meta, TikTok and PKNIC accounts under the client’s own email and billing details.
