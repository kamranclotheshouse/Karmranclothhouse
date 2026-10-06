# 🗺️ Phased Implementation Roadmap

## Project: Kamran Cloth House
A modular, phase-by-phase execution plan ensuring high code quality, zero regressions, and easy handover for any developer or AI assistant.

---

## 📌 Milestone Overview

```
[Phase 1] ──► [Phase 2] ──► [Phase 3] ──► [Phase 4] ──► [Phase 5] ──► [Phase 6]
Foundations   Catalog &     COD Checkout   Admin CMS     Tracking &    SEO, QA &
& Royal UI    PDP System    & WhatsApp     & Orders      Pixels        Handover
```

---

## 🟢 Phase 1: Core Foundation & Design System
**Objective:** Set up the Next.js project with the visual identity (see "Rebrand" section below for the current Green & Gold system), layout architecture, and reusable UI tokens.

- [x] **1.1 Next.js 14/15 App Router Initialization**
  - Non-interactive modern setup with TypeScript & Tailwind CSS. (Installed on Next 16.3.8 / React 19.)
- [x] **1.2 Design System & Styling Tokens**
  - ✅ Original Graceline palette shipped first; **superseded by Green & Gold** (Phase R0 below).
  - Google Fonts setup: `Playfair Display` headings (was Tenor Sans), `Outfit` for UI text.
- [x] **1.3 Global Layout Components**
  - Top Utility Bar (address, trust badges, phone, WhatsApp, socials).
  - Sticky green Header with gold logo, sentence-case nav tabs (active = gold underline), Categories mega-dropdown, search / account / cart icons.
  - Floating WhatsApp Quick Chat button.
  - Comprehensive 4-column Footer (Shafi Market Saddar Google Maps link, contact numbers, customer-service links, socials).
- [x] **Deliverable of Phase 1:** Interactive shell of the website with active header, footer, color system, and responsive mobile navigation.

---

## 🟢 Phase 2: Catalog Showcase, Brands & Product Detail Pages (PDP)
**Objective:** Deliver the browsing experience for unstitched fabrics, brands, and categories.

- [x] **2.1 Homepage Core Sections**
  - Hero Carousel (multi-slide, admin-editable) with gold CTAs. ✅
  - Trust strip + inside-hero trust badges. ✅
  - Categories Grid with dark-green label bars (6 categories after reseed). ✅
  - ⚠️ Brands carousel / bestsellers / reviews sections **removed** — homepage is now exactly the 5 sections in the client brief (see Rebrand R3).
- [x] **2.2 Category & Brands Directory Pages**
  - `/categories` & `/categories/[slug]`. Brand + color filters live (Rebrand R4 ✅).
  - `/brands` & `/brands/[slug]` dedicated showcase for Grace, Pasha, Gul Ahmed, etc.
- [x] **2.3 Product Detail Page (`/product/[slug]`)**
  - High-resolution zoomable fabric image gallery (demonstrating weave and texture). ⚠️ Thumbnail switcher only — no pinch/zoom yet.
  - Interactive color variant picker with live swatch selection.
  - Fabric technical specifications badge (Length: 4.0/4.5m, Width: 54", Season, Blend).
  - Direct Actions: "Add to Cart", "Cash on Delivery Order" and "Order via WhatsApp".
  - Related products row ("More from {category}"). ✅
- [x] **Deliverable of Phase 2:** Fully browsable catalog with realistic seed data and luxury product detail views. (16 products, 8 categories, 30 brands — all SSG; reseeding to 6 categories / ~56 products in Rebrand R5.)

---

## 🟢 Phase 3: Frictionless Cash on Delivery (COD) Checkout & WhatsApp Flow
**Objective:** Build high-converting checkout tailored to Pakistani customer habits.

- [x] **3.1 One-Step COD Checkout Drawer / Modal**
  - Opens instantly without navigating away from the product.
  - Fields: Full Name, WhatsApp/Phone number, Delivery Address, City (with Pakistan cities auto-suggest).
  - Live summary of selected fabric, color variant, quantity, delivery fee calculation.
- [x] **3.2 WhatsApp Direct Order Link Generator**
  - Pre-encoded message template with Product Name, Selected Color, Price, and Direct URL.
  - Enables customers who prefer chatting with the shopkeeper to order with 1 tap.
- [x] **3.3 Order Confirmation & Thank You Experience**
  - Unique Order ID generation (e.g. `KCH-1045`).
  - Success screen with order summary and instant WhatsApp confirmation button.
- [x] **3.4 Cart Layer + Search (added during frontend completion)**
  - Persistent cart drawer (localStorage + `useSyncExternalStore`), quantity edit, free-delivery progress.
  - Multi-item checkout drawer (order summary lines, WhatsApp confirm lists every line).
  - Header search overlay + `/search` page (debounced, matches title/description/brand/category).
- [x] **Deliverable of Phase 3:** Complete end-to-end purchasing loop working seamlessly on mobile. (+ `/track`, `/delivery`, `/returns` policy pages.)

---

## 🟢 Phase 4: Mobile-Friendly Admin Portal (Client Self-Management)
**Objective:** Allow Kamran Cloth House management to update products, prices, banners, and fulfill orders without a developer.

- [x] **4.1 Admin Authentication & Route Protection**
  - Secure PIN login screen at `/admin`. HMAC-signed httpOnly cookie, `ADMIN_PIN` from `.env.local`.
  - ⚠️ UI-level gate only — real hardening would need row-level security (Neon/Postgres) on the orders/products tables.
- [x] **4.2 Product Manager Dashboard**
  - Add / Edit / Delete products (Neon CRUD + admin UI). ✅
  - Color variant editor (color name, hex picker, in-stock toggle). ✅
  - Bulk stock toggle (In Stock / Out of Stock) — per-product + bulk. ✅
  - Photo upload: paste-image-URL workflow works today; **signed Cloudinary upload pending API keys.**
- [x] **4.3 Order Management Hub**
  - Orders list with status badges (`Pending`, `Confirmed`, `Dispatched`, `Delivered`, `Cancelled`).
  - Search by customer phone or order number.
  - One-click customer WhatsApp update message (e.g. "Your order KCH-1045 has been dispatched via TCS").
  - Printable / Downloadable thermal packing invoice. (Print via `@media print` slip; download not added.)
- [x] **4.4 Banner & Announcement Manager**
  - Multi-slide hero carousel editor (up to 5 slides, reorder/add/remove), winter/promo banner, top announcement text — at `/admin/banners`. Applies instantly, one-tap reset to defaults.
  - ⚠️ Hero *photo* hosting needs Cloudinary keys (paste URL works today).
- [x] **Deliverable of Phase 4:** Functional, intuitive client dashboard operable from a smartphone.

---

## 🟢 Phase 5: Pixel Retargeting, Analytics & Mobile Performance
**Objective:** Prepare the website for profitable Meta & TikTok ad campaigns.

- [ ] **5.1 Pixel Integration**
  - Meta (Facebook/Instagram) Pixel script injection.
  - TikTok Events Pixel script injection.
- [ ] **5.2 Standard E-Commerce Events Wiring**
  - `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `WhatsAppContact`.
- [ ] **5.3 Mobile Optimization & Speed Tuning**
  - WebP/AVIF image pipeline.
  - Sub-1.5s load time on Pakistani 4G mobile networks.
- [ ] **Deliverable of Phase 5:** Verified pixel firing in Meta Pixel Helper & TikTok Pixel Helper.

---

## 🟢 Phase 6: Local SEO, Final Polish & Client Handover
**Objective:** Complete final quality assurance, local search rankings, and handover materials.

- [ ] **6.1 Local SEO & Schema Markup**
  - LocalBusiness Structured Data (Shafi Market, Saddar, Peshawar coordinates).
  - Product & OpenGraph metadata for preview cards on WhatsApp/Facebook sharing.
- [ ] **6.2 Cross-Device QA**
  - Android Chrome, iOS Safari, desktop resolution checks.
- [ ] **6.3 Client Handover Documentation**
  - Simple Urdu & English video/text guide explaining how to add products and fulfill orders.
- [ ] **Deliverable of Phase 6:** Live production deployment on Vercel with custom domain.

---

# 🟢 Rebrand & Feature Completion Workstream (Oct 2026)

New client brief: **Green & Gold** identity, 5-section homepage matching the approved
reference design, 6-category catalogue (~56 products), category filters, new pages,
Meta + TikTok pixels. This supersedes the original Graceline direction.

```
[R0] ──► [R1] ──► [R2] ──► [R3] ──► [R4] ──► [R5] ──► [R6] ──► [R7] ──► [R8]
Tokens   Chrome   Colour   Home     Category  Catalog   New      Pixels   Verify
         & Nav    Sweep    5 secs   Filters   Reseed    Pages
```

- [x] **R0 — Foundation:** `globals.css` Green & Gold tokens + semantic utilities, Playfair Display + Outfit fonts, `DESIGN_SYSTEM.md` rewritten (§11 documents the Graceline migration).
- [x] **R1 — Chrome:** TopBar, green Header (sentence-case tabs, gold active underline, full-width Categories dropdown, account icon), 4-column deep-green Footer, layout wiring.
- [x] **R2 — Colour sweep:** Storefront components moved to semantic tokens (`bg-brand`, `text-gold`, `bg-cream`, `text-ink`…); shared `Button`/`Input`/`Select`/`Badge` primitives.
- [x] **R3 — Homepage rebuild:** Exactly 5 sections — multi-slide Hero Carousel (left-aligned, gold buttons, in-hero trust badges), Categories Grid (cream, green label bars), Winter promo banner, Trust strip (gold SVG icons), Footer. Section order matches the reference. Hero banner editor upgraded to slides + promo at `/admin/banners`.
- [x] **R4 — Category filters:** `ProductGrid` gained `showFilters` — brand chips + color swatch chips self-populated from the products (only real `color_variants`, no fake entries), single-select with "Clear filters", filtered count (`X of Y Products`), filtered-empty state with Clear + WhatsApp actions, WhatsApp fallback line when a category has no colors. Brand row auto-hides on brand pages (0–1 brands). Wired on `/categories/[slug]` and `/brands/[slug]` with `getStoreSettings().whatsappNumber`. `/categories` directory already on-brand (Playfair/green/gold) — no restyle needed.
- [x] **R5 — Catalogue reseed:** `product_categories` join table added to schema + migrate; 6 categories (`cotton`, `kapra`, `winter-fabric`, `dulha-design`, `coat-waistcoat`, `shawls` — legacy 3 purged) and **55 products** per full client brief (Cotton 15, Kapra 19+Astoor, Winter 5, Dulha 3, Coat 1+Silky Joy, Shawls 12), 35 brands, placeholder prices, "Available in N colours" in descriptions, `colors: []` until client adds real ones (PDP/card made empty-colour-safe). `getProductsByCategory` = primary OR `product_categories` EXISTS; admin product form gained **"Also appears in"** checkboxes (API `alsoIn`, seed syncs). Test scripts (`verify-db`, `db:test`, `smoke:api`) now derive counts from `data.ts`; seed gained transient-connect retries (flaky AWS SG route).
- [x] **R6 — New pages:** `/tailoring` ✅ (shipped separately), `/how-to-order` (5-step COD flow), `/faq` (10 Q&As, native `<details>` accordion, settings-driven delivery figures), `/privacy`, `/terms` — all Green & Gold with settings-driven WhatsApp CTA; `/about` was already on-brand; Tenor Sans leftovers purged from `error.tsx` + `search/page.tsx`. All footer customer-service links now resolve.
- [x] **R7 — Pixels:** `src/lib/analytics.ts` (safe no-op helpers) + `PixelLoader` (injects Meta `fbq` + TikTok `ttq` snippets from `store_settings.metaPixelId`/`tiktokPixelId`, empty ID = disabled; PageView on load + every client route change). Events wired: ViewContent (PDP mount), AddToCart (checkout drawer open), Purchase / CompletePayment (order accepted). Round-trip tested with fake IDs and reverted to empty.
- [x] **R8 — Verify:** `lint` (0 errors) → `tsc` (0) → `smoke:api` **137/137** → `db:verify` 17/17 → `db:test` 34/34 → `build` (116 pages) — all green. Smoke aligned to the carousel hero API (and fixed a real bug: `/api/admin/home` was dropping `id`/`sortOrder`/`isActive` on slide saves, so hide/reorder reverted); home check now asserts the DB-driven bestseller rail (top-4 ordering).
- [x] **Client contact details live:** real address (Main Tipu Sultan Road, Shafi Bazar, Bangash Market, Shop #1, Saddar Peshawar), phone/WhatsApp +92 333 4764131, Facebook/Instagram/TikTok links and Google Maps embed saved to `store_settings` + seed defaults (footer, header, contact page, all CTAs updated; `/contact` gained a "Find Our Store" map section).
- [x] **Cloudinary live:** real credentials in `.env.local` (cloud `zu6qosx4`) — admin image upload verified end-to-end (test image → `res.cloudinary.com/zu6qosx4/kch-products/…`).
- [x] **Hero updates:** primary CTA → **Contact on WhatsApp** (`https://wa.me/923334764131`), new **Winter** slide added (`/images/winter-fabric.jpg`, “Shop Winter Collection” → `/categories/winter-fabric`); defaults in `hero.ts`, fresh-DB seed inserts all slides, admin “Restore default” restores all slides. Still owed by client: filled product sheet (photos/prices), Meta/TikTok pixel IDs, CNIC+email for `.pk` domain.
