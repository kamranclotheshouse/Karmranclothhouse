# Kamran Cloth House

Production website for Kamran Cloth House, Shafi Market, Saddar, Peshawar.

## Live links

- Storefront: https://www.kamranclothhouse.pk
- Admin: https://www.kamranclothhouse.pk/admin
- Repository: https://github.com/kamranclotheshouse/Karmranclothhouse

## Features

- Six catalogue categories and 57 products.
- Search, brand/category browsing, colour variants and product pages.
- Cart and Cash on Delivery checkout.
- WhatsApp ordering and public order tracking.
- Admin management for products, brands, categories, homepage banners, settings and orders.
- Cloudinary WebP image uploads.
- Meta and TikTok Pixel events configured from the admin settings.

## Development

Requirements: Node.js 20+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Local database setup:

```bash
npm run db:migrate
npm run db:seed
```

When `NEON_DATABASE_URL` is absent, development uses local PGlite. Production uses Neon PostgreSQL.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run TypeScript checks |
| `npm run db:migrate` | Apply database schema |
| `npm run db:seed` | Seed a fresh database |
| `npm run db:verify` | Verify seeded catalogue |
| `npm run db:test` | Run catalogue checks |

Do not run `db:seed` on the live database after content has been edited from the admin panel.

## Production environment

Required Vercel variables are listed in `.env.example`. Real secrets belong only in Vercel or a local `.env.local` file; never commit them.

The canonical production URL is:

```text
https://www.kamranclothhouse.pk
```
