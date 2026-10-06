# 🎨 Design System — Kamran Cloth House
## For Developers & AI Assistants

This document captures the complete visual identity and implementation decisions made for this project. Any developer or AI picking up this codebase must read this file first.

---

## 1. Design Inspiration

The site design is **Green & Gold** — a premium, traditional, trustworthy aesthetic for a men's fabric/clothing store in Shafi Market, Saddar, Peshawar.

**Key characteristics:**
- Deep forest green (`#0E3B2C`) as the primary brand surface — header, hero, footer, CTAs
- Gold (`#C9A227`) for accents, icons, text on green — 4.8:1 contrast ✓
- Deep gold (`#7A5F0E`) for gold text on light/cream surfaces — 4.5:1 contrast ✓
- Cream (`#F5F0E6`) for alternate sections — warm, paper-like feel
- White (`#FFFFFF`) for main content areas — clean, airy
- `Playfair Display` for all headings — elegant, high-contrast serif, mixed-case (NOT uppercase)
- `Outfit` for body text, UI, nav — modern, highly legible
- Thin `1px` borders in warm taupe (`rgb(211 206 197)`) — never harsh black borders
- Buttons: solid green / gold outline / green outline — no rounded corners (2px max radius)
- Hover effects: simple `opacity`/`color` fade — never color-change gimmicks
- Category grids use `gap-px` with border fill — hover inverts

---

## 2. Color Palette

```css
:root {
  /* Brand surfaces */
  --color-green: #0E3B2C;          /* Deep forest — header, hero, footer, dark sections */
  --color-green-deep: #0A2B20;     /* Footer base / gradient end */
  --color-green-soft: #1A5140;     /* Hover, secondary panels */

  /* Gold accents */
  --color-gold: #C9A227;           /* Gold ON green — 4.8:1 ✓ */
  --color-gold-text: #7A5F0E;      /* Gold text ON cream/white — 4.5:1 ✓ */

  /* Light surfaces */
  --color-cream: #F5F0E6;          /* Alternate light sections */
  --color-ink: #10231C;            /* Body text on cream */

  /* Semantic (recommended for components) */
  --color-bg-primary: #FFFFFF;     /* Main page background */
  --color-bg-secondary: #F5F0E6;   /* Alternate sections (cream) */
  --color-bg-dark: #0A2B20;        /* Dark sections (deep green) */

  --color-fg-primary: #10231C;     /* Main text on light */
  --color-fg-muted: rgba(16, 35, 28, 0.55); /* Secondary/caption text */

  --color-border: rgb(211 206 197);      /* Default dividers & card borders */
  --color-border-strong: #10231C;        /* Emphasized borders, button borders */

  /* WhatsApp CTA — kept distinct from site green */
  --color-whatsapp: #0E7C6E;
  --color-whatsapp-hover: #0A6156;
}
```

**Usage rules:**
- `--color-gold` (bright gold): **only on dark/green surfaces** — reaches 4.8:1 on `#0E3B2C`
- `--color-gold-text` (deep gold): **any gold text on white, cream, or light gold** — clears 4.5:1
- `--color-brand` / `--color-green`: primary brand surface — header, hero, footer, primary buttons
- `--color-cream` / `--color-bg-secondary`: alternate section backgrounds
- `--color-ink` / `--color-fg-primary`: body text on light surfaces
- `--color-bg-dark` / `--color-green-deep`: only for footer, deep panels
- `--color-whatsapp` / `--color-whatsapp-hover`: WhatsApp floating button & links — white label clears 5:1
- `--color-border`: used everywhere as the default border/divider color (warm taupe)

### Contrast floor (WCAG AA)
Small text (< 18px) needs **4.5:1**; non-text graphics need **3:1**. Never pair a text color with a background of the same or near-identical hue. Verify with `cr()` from any contrast checker before introducing a new pairing.

---

## 3. Typography

| Role | Font | Style | Notes |
|---|---|---|---|
| **Headings (h1–h5)** | `Playfair Display, serif` | `font-weight: 500`, **mixed-case**, `letter-spacing: 0.02em` | Loaded via Google Fonts |
| **Body text, UI, nav** | `Outfit, sans-serif` | `font-weight: 400–600` | Loaded via Google Fonts |

Both fonts are loaded through `next/font/google` in `src/app/layout.tsx`, which exposes them as the `--font-playfair` and `--font-outfit` CSS variables. Do **not** add a Google Fonts `@import` in `globals.css` — it would duplicate the request and reintroduce layout shift.

### Heading Size Reference
```css
h1: clamp(3rem, 8vw, 6rem)  /* Hero heading only */
h2: 2.5rem–3.5rem           /* Section headings */
h3: 1.25rem                 /* Card titles */
```

### Letter Spacing Reference
- Eyebrow/labels: `tracking-[0.35em]` / `tracking-[0.4em]`
- Section headings (h2): `tracking-wide` or `tracking-[0.1em]`
- Nav links: `tracking-widest`
- Logo: `tracking-[0.2em]`

---

## 4. Component Rules

### Buttons
```
Primary (solid green):   bg-brand text-white border-brand → hover: bg-brand-soft
Secondary (gold outline): bg-transparent border-gold text-gold → hover: bg-gold text-white
Tertiary (green outline): bg-transparent border-brand text-brand → hover: bg-brand text-white
Transition:              all 300ms, no transform/scale effects
Border radius:           0px–2px only (square feel)
Padding:                 px-10 py-4 for large CTAs
Text:                    xs, tracking-[0.25em], uppercase
```

### Cards (Product Cards)
```
Background:  white
Border:      1px solid var(--color-border)
Image ratio: aspect-[3/4]  (portrait — fabric products)
Image bg:    #F5F3F0 placeholder
Hover:       box-shadow subtle (no scale transforms)
```

### Category Grid
```
Layout:    grid gap-px (border fills the gap between cells)
Container: bg set to var(--color-border) so gaps appear as thin lines
Cell:      bg-white, hover → bg-brand text-white (transition-colors duration-300)
```

---

## 5. Layout Structure

```
[ Top Bar ]               green bg, gold text: address | badges | phone | socials
[ Header ]                green bg, sticky, h-20, gold logo, white nav, search + cart
[ <main> ]                page content (white/cream sections)
[ WhatsApp Button ]       fixed bottom-right, #0E7C6E, ping animation
[ Footer ]                deep green bg, 4-col grid (gold headings, white text)
```

### Max Width
- All content: `max-w-7xl mx-auto px-4 sm:px-6`
- Narrow content (hero text): `max-w-4xl mx-auto`

---

## 6. File Structure

```
src/
├── app/
│   ├── globals.css              ← Design tokens, base styles (no font @import — see §3)
│   ├── layout.tsx               ← Root layout (fonts, metadataBase, TopBar + Header + Footer + WhatsApp)
│   ├── page.tsx                 ← Homepage (5 sections: Hero carousel, Categories, Trust strip, Winter banner, Footer)
│   ├── admin/
│   │   ├── layout.tsx           ← Auth gate + admin nav
│   │   ├── page.tsx             ← Dashboard: stats + recent orders
│   │   ├── orders/page.tsx      ← Search, status filter, WhatsApp update, print slip
│   │   ├── products/page.tsx    ← Stock toggles + bulk actions
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── banners/page.tsx     ← Hero slides + Winter promo + Announcement
│   │   └── settings/page.tsx    ← Store settings (includes pixel IDs)
│   ├── api/admin/auth/
│   │   ├── route.ts             ← POST login (sets HMAC cookie) / DELETE logout
│   │   └── verify/route.ts      ← GET session check
│   ├── brands/
│   │   ├── page.tsx             ← All brands grid
│   │   └── [slug]/page.tsx      ← Individual brand collection
│   ├── categories/
│   │   ├── page.tsx             ← All categories grid
│   │   └── [slug]/page.tsx      ← Category product listing + brand/color filters
│   ├── product/[slug]/page.tsx  ← PDP server shell: generateMetadata/generateStaticParams/notFound
│   ├── about/page.tsx           ← About & Trust page
│   ├── contact/page.tsx         ← Contact + Map
│   ├── track/page.tsx           ← Order tracking (lookup by KCH order number)
│   ├── delivery/page.tsx        ← Delivery & free-shipping policy
│   ├── returns/page.tsx         ← Returns & exchange policy
│   ├── tailoring/page.tsx       ← Tailoring services
│   ├── faq/page.tsx             ← FAQs
│   ├── privacy/page.tsx         ← Privacy Policy
│   ├── terms/page.tsx           ← Terms & Conditions
│   └── how-to-order/page.tsx    ← How to Order guide
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx           ← Green utility bar above header
│   │   ├── Header.tsx           ← Sticky green header with Categories dropdown
│   │   ├── Footer.tsx           ← 4-col deep green footer
│   │   ├── WhatsAppButton.tsx   ← Fixed floating WhatsApp button
│   │   └── SearchOverlay.tsx    ← Full-width search panel
│   ├── home/
│   │   ├── Hero.tsx             ← Multi-slide carousel (admin-editable)
│   │   ├── CategoriesGrid.tsx
│   │   ├── TrustStrip.tsx
│   │   └── WinterBanner.tsx
│   ├── product/
│   │   ├── ProductCard.tsx      ← Shared product card
│   │   ├── ProductDetails.tsx   ← Interactive PDP body (client)
│   │   └── ProductGrid.tsx      ← Client-side sort + grid
│   ├── checkout/CheckoutDrawer.tsx ← One-step COD drawer + order save
│   ├── cart/CartDrawer.tsx      ← Multi-item basket drawer
│   └── ui/                      ← Button, Input, Select, Badge primitives
├── hooks/
│   ├── useOrders.ts
│   └── useCart.ts
├── lib/
│   ├── data.ts                  ← Types: Product, Category, Brand, ColorVariant
│   ├── orders.ts                ← Order type, KCH-#### numbers, status updates
│   ├── settings.ts              ← StoreSettings, getDeliveryFee
│   ├── hero.ts                  ← HeroContent (now array for carousel)
│   ├── session.ts               ← HMAC-signed admin cookie helpers
│   ├── analytics.ts             ← Meta + TikTok Pixel event dispatcher
│   └── db/
│       ├── driver.ts
│       ├── catalogue.ts
│       ├── storefront.ts
│       ├── settings.ts
│       ├── banners.ts
│       ├── orders.ts
│       └── seed.ts
└── styles/admin.css             ← Admin panel styles + print-slip @media print rules
```

---

## 7. Phase Completion Status

| Phase | Status | Description |
|---|---|---|
| Phase 0 | ✅ Complete | Foundation, Design System, Layout, Fonts, Tokens |
| Phase 1 | ⏳ In Progress | Chrome: TopBar, Header, Footer, WhatsApp |
| Phase 2 | ⏳ Pending | Colour sweep + semantic primitives |
| Phase 3 | ⏳ Pending | Homepage rebuild: Hero carousel, Categories, Trust strip, Winter banner |
| Phase 4 | ⏳ Pending | Category page: real brand + color filters |
| Phase 5 | ⏳ Pending | Data reseed: 6 categories, ~56 products, join table, purge |
| Phase 6 | ⏳ Pending | New pages: Tailoring, FAQ, Privacy, Terms, How-to-Order |
| Phase 7 | ⏳ Pending | Meta & TikTok Pixels, 4 events |
| Phase 8 | ⏳ Pending | Verify: lint, tsc, smoke, db:verify, db:test, build |

---

## 8. Backend & Data (Neon)

- **Database:** Neon PostgreSQL (free tier, `ap-southeast-1`)
- **Tables:** `products`, `brands`, `categories`, `orders`, `banners`, `store_settings`, `page_content`, **`product_categories`**
- **Storage:** Cloudinary (pending credentials) for product/hero images
- **Auth:** HMAC-signed httpOnly cookie for admin panel

---

## 9. Key Business Rules

- **No Payment Gateway** — Cash on Delivery (COD) only
- **WhatsApp Order**: Pre-filled `wa.me` link with product name + color + URL
- **Order Number Format**: `KCH-XXXX` (e.g. KCH-1042)
- **Free Delivery Threshold**: Rs. 5,000 (configurable via `store_settings`)
- **Default Delivery Charge**: Rs. 250
- **Store WhatsApp Number**: Placeholder `923000000000` — replace with real number before launch
- **Pixel IDs**: Meta Pixel ID and TikTok Pixel ID stored in `store_settings` — configurable by client from Admin Panel
- **Multi-category products**: `products.category_id` = primary category; `product_categories` = additional categories

---

## 10. Do's and Don'ts

### ✅ DO
- Use `var(--color-*)` CSS variables everywhere — never hardcode colors
- Use semantic Tailwind names (`bg-brand`, `text-gold`, `bg-cream`, `border-line`, `text-muted`) — future rebrand = token change only
- Keep headings **mixed-case** via CSS (no `text-transform: uppercase`)
- Use `tracking-[0.35em]` / `tracking-[0.4em]` for small labels/eyebrows
- Keep borders thin (`1px`) in `var(--color-border)` warm taupe
- Use `transition-opacity hover:opacity-50` / `hover:bg-brand-soft` for interactive states

### ❌ DON'T
- Don't use Tailwind's arbitrary color values like `bg-[#0E3B2C]` — use `bg-brand` instead
- Don't add `font-bold` to headings — Playfair 500 is the right weight
- Don't use rounded corners larger than `rounded-sm` (2px)
- Don't use `scale` or `translateY` transform animations — too flashy for this brand
- Don't use uppercase on headings — mixed-case serif is the brand voice
- Don't hardcode black/white/zinc utilities in new components — use semantic tokens

---

## 11. Migration Notes (from Graceline bone/ivory)

The previous design system used:
- Bone/ivory `#EDEBE7` backgrounds + black CTAs + gold accents
- Tenor Sans uppercase headings
- White sticky header + black announcement bar

This has been **fully replaced** by the Green & Gold system above. All components must be migrated to the new tokens. The `globals.css` `@theme inline` block provides semantic Tailwind names to make this mechanical.