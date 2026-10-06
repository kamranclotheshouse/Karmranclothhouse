# 📋 Product Requirements Document (PRD)
## Project: Kamran Cloth House — Premium E-Commerce Showcase & COD Ordering

- **Client:** Kamran Cloth House
- **Location:** Shafi Market, Saddar, Peshawar, KP, Pakistan
- **Niche:** Premium Men's Unstitched Fabric, Groom Wear (Dulha Design), Winter/Summer Luxury Fabrics, Waistcoats, Coats, and Shawls
- **Target Audience:** Premium fabric seekers, wedding/dulha shoppers, overseas Pakistanis, and TikTok/Instagram ad audiences looking for genuine high-grade local & imported fabrics with Cash on Delivery (COD).

---

## 1. Executive Summary & Vision

Kamran Cloth House needs an ultra-fast, mobile-first website that conveys royal heritage, luxury, and trust (avoiding cheap bazaar vibes). The site acts as both a premium product showcase and a frictionless direct-to-consumer Cash on Delivery (COD) ordering platform. 

Because traffic will primarily originate from Meta (Instagram/Facebook) and TikTok video ads, the website must load in under 1.5 seconds on 4G mobile connections, offer an effortless 1-page checkout without complex account creation, and trigger automated WhatsApp order notifications.

---

## 2. Branding & Design Aesthetics

> **Authoritative source:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). The **Green & Gold**
> palette below is the approved direction — it replaced the earlier Graceline white/taupe
> concept after the client issued a new brief (green background + gold text/icons,
> premium/traditional/trustworthy feel, never discount/bazaar).

- **Primary Colors:**
  - Deep Forest Green (`#0E3B2C`): Header, hero, dark sections — the brand surface.
  - Deep Green (`#0A2B20`): Footer base, trust strip, label bars, gradient end.
  - Soft Green (`#1A5140`): Hover states, secondary panels.
  - Cream (`#F5F0E6`): Alternate light sections (categories grid, etc.).
  - White (`#FFFFFF`): Main page background.
  - Ink (`#10231C`): Body text on light surfaces.
- **Gold (accent):**
  - Gold (`#C9A227`): Gold ON green surfaces — buttons, eyebrows, icons (4.8:1 ✓).
  - Gold Text (`#7A5F0E`): Gold text ON cream/white — eyebrows, links (4.5:1 ✓).
  - Solid gold buttons use `#C9A227` background with ink `#10231C` text.
- **Typography:**
  - Headings: `Playfair Display` (serif) — mixed case, never uppercase.
  - Body & UI: `Outfit` (sans-serif) — `font-weight: 300–600`, mobile-first.
- **Contrast rules (WCAG AA minimum):**
  - Small text (< 18px) requires 4.5:1 against its background.
  - Never pair a text color with a background of the same or a near-identical hue.
  - WhatsApp CTAs use `#0E7C6E` with white text (5.1:1); the brighter `#25D366` brand green
    only reaches 1.98:1 and must not be used behind text.
- **Visual Feel:**
  - Premium, traditional, trustworthy — royal heritage, never bazaar/discount.
  - Thin 1px borders, square corners (0–2px radius), gold used as accent (buttons,
    eyebrows, icons, active states) — large surfaces stay green or cream.
  - High-resolution unstitched fabric texture zoom and fabric drape view on the PDP.

---

## 3. Core Pages & Information Architecture

### 3.1. Homepage (exactly 5 sections — client brief, matches the approved reference design)
1. **Top Utility Bar + Header:**
   - Top bar: store address, "100% Original Branded Fabrics", "Cash on Delivery Across Pakistan", phone, WhatsApp, social icons.
   - Green sticky header: gold logo, sentence-case tabs **Home · About Us · Brands · Categories ▾ · Tailoring · Contact Us** (active tab = gold + underline), search / account / cart icons with gold count badge.
   - Categories ▾ = full-width dropdown panel (thumbnail tiles + dark-green label bars + "View All Categories →").
2. **Hero Carousel (multi-slide, admin-editable):**
   - Left-aligned content: gold eyebrow, Playfair heading (2 lines), subtitle, **gold primary button + arrow** and white-outline secondary button.
   - Inside-hero trust badge row (4): Original Branded Fabrics · In-House Tailoring · Cash on Delivery All Over Pakistan · Trusted by Thousands.
   - Auto-advance (5s), prev/next arrows, dots; up to 5 slides managed at `/admin/banners`.
3. **Categories Grid** — eyebrow "SHOP BY CATEGORY" + "Explore Our Collections" (gold side lines), 6 cards with image tile + solid dark-green label bar:
   - Cotton · Kapra / Wash-n-Wear · Winter Fabric · Dulha (Groom) Design · Coat & Waistcoat · Shawls
4. **Season Highlight Banner** — admin-editable promo (dark green, gold primary button, eyebrow/heading/subtitle/two CTAs).
5. **Trust Strip → Footer** — deep-green strip: Quality Guarantee · Imported + Local Fabric · In-House Tailoring (gold SVG icons), then the 4-column footer (Quick Links, Customer Service incl. How to Order / FAQs / Privacy / Terms, contact + map, socials).

### 3.2. Brands Hub (`/brands` & `/brands/[slug]`)
- Grid of all ~30 brands (Grace, Pasha Fabrics, Gul Ahmed, Din Fabrics, Ahmad Fabrics, Rashid Fabrics, Al-Karam, etc.).
- Dedicated brand collection page with filters: Fabric Type, Season, Color, Price range, In-stock.

### 3.3. Categories Hub (`/categories` & `/categories/[slug]`)
- Breadcrumbs, dynamic banner, sorting (Featured, Price Low-High, Price High-Low, Bestsellers).
- **Category page filters (client brief):** Brand filter + Color filter on every category page.
  - Colors aggregate from the products' real `color_variants` in that category (self-populating as the client adds colors — no fake color entries).
  - Empty filter state → "Colors ke liye WhatsApp karein" fallback.
- The 6 active categories: `cotton`, `kapra`, `winter-fabric`, `dulha-design`, `coat-waistcoat`, `shawls`.
- Shawl **type** variants are separate products (Swat Salampur ×7, Bannu ×1, Charsadda ×2, Velvet 3 Gul ×1, Bachkana ×1 = 12 shawl products). Colors sit on each product's `color_variants`.
- Products in two categories use a `product_categories` join table: **Astoor = Cotton + Kapra** (per full client brief), **Silky Joy = Dulha Design + Coat & Waistcoat** (confirm exact split with client).

### 3.4. Product Detail Page (PDP) (`/product/[slug]`)
- Multi-photo gallery with high-zoom lens (showing weave and thread texture).
- Color swatches with live preview switch.
- Fabric specs sheet: Length (e.g., 4 meters suit piece), Width (e.g., 54 inches bara bahr), Season, Blend, Texture.
- Primary Actions:
  - **"Add to Cart"** — pushes into the persistent cart drawer (localStorage-backed).
  - **"Buy via Cash on Delivery"** — opens the 1-step checkout drawer directly for that item.
  - **"Order on WhatsApp"** (Pre-fills WhatsApp message with product title, color, price, and current URL).
- **"More from {category}"** related-products row (same category, filled with featured/bestsellers, max 4).
- Guarantee and delivery timeline accordion.

### 3.5. About Us & Trust Page (`/about`)
- Story of Kamran Cloth House in Shafi Market, Saddar, Peshawar.
- Quality commitment: How fabrics are sourced and tested for color-fastness (Bur-free & Rang-guarantee).
- Physical store visit invitation.

### 3.6. Contact & Store Locator (`/contact`)
- Google Maps embed showing Shafi Market, Saddar, Peshawar.
- One-tap WhatsApp chat, Phone call, Store timings (including Friday prayer timings).
- Contact inquiry form (saves to DB + opens WhatsApp with the message).

### 3.7. Search (`/search` + header overlay)
- Header search icon opens a debounced overlay; `/search` page shows full results.
- Matches product title, description, brand and category (case-insensitive).

### 3.8. Cart & Checkout
- Cart drawer (persistent via localStorage) with quantity edit, remove, free-delivery progress bar.
- Checkout drawer: customer details (name, WhatsApp phone, address, city from the 27-city list, notes), multi-item order summary, COD, delivery fee + free-delivery threshold, WhatsApp confirm message listing every order line.

### 3.9. New Static Pages (client brief — all required)
- `/tailoring` — in-house tailoring service (cuts, stitching, turnaround, how to book).
- `/how-to-order` — step-by-step COD ordering guide.
- `/faq` — frequently asked questions (delivery, returns, fabric care, tailoring).
- `/returns` — returns & exchanges policy. *(exists)*
- `/delivery` — delivery info & charges. *(exists)*
- `/privacy` — privacy policy.
- `/terms` — terms & conditions.
- Footer links to all of the above under "Customer Service".

---

## 4. Frictionless Ordering System (Cash on Delivery)

- **No Compulsory Registration:** Customer enters details directly at checkout to eliminate cart abandonment.
- **Fields Required:**
  1. Full Name
  2. Mobile / WhatsApp Number (Pakistan format `03XX-XXXXXXX`)
  3. Alternative Phone (Optional)
  4. Delivery Address (House/Street/Area)
  5. City (with auto-suggest for top Pakistani cities: Peshawar, Islamabad, Lahore, Karachi, Rawalpindi, etc.)
  6. Cart items (color variant & quantity per line item)
  7. Special Instructions (e.g. "Gift pack", "Need stitching service")
- **Order Process:**
  1. Customer clicks "Confirm Order (Cash on Delivery)".
  2. Order is instantly written to the **Neon** database with status `Pending`.
  3. Meta & TikTok `Purchase` pixel event fires with order ID and value.
  4. Instant confirmation with:
     - Order Number (e.g. `KCH-1082`)
     - Button: *"Confirm immediately on WhatsApp"* (Sends automated order summary to shop's WhatsApp).
  5. Store Owner receives alert in the `/admin/orders` hub.

---

## 5. Content Management System (CMS & Admin Panel)

A dedicated, mobile-friendly Admin Portal (`/admin`) secured with PIN login (HMAC httpOnly cookie):
1. **Dashboard:** Recent orders, quick actions. ✅
2. **Product Manager:** ✅ (photo upload via URL until Cloudinary keys arrive)
   - Add/edit/delete products with title, description, brand, category, price, compare-at price, fabric specs.
   - Color variants editor (name + hex + stock).
   - Multi-image gallery (paste image URLs; signed Cloudinary upload pending credentials).
   - Toggles: In Stock, Featured, Bestseller.
   - "Also appears in" category checkboxes (dual-category products via join table).
3. **Brand Manager:** Add/edit/delete brands. ✅
4. **Category Manager:** Manage categories with banner photos. ✅ (6 categories after reseed)
5. **Banner & Offer Manager:** Multi-slide hero carousel (up to 5 slides), winter/promo banner, top announcement bar — all editable without code. ✅
6. **Store Settings:** Name, address, phone, WhatsApp, email, hours, delivery fee, free-delivery threshold, **Meta & TikTok Pixel IDs**, social links. ✅
7. **Order Management:**
   - View order list with search & filter by status (`Pending`, `Confirmed`, `Dispatched`, `Delivered`, `Cancelled`). ✅
   - One-click "Send WhatsApp Status Update" to customer. ✅
   - Printable packing slip. ✅

---

## 6. Marketing, Pixels & Retargeting

- **Tracking Script Integration:**
  - Meta Pixel (Facebook / Instagram Ads)
  - TikTok Pixel (TikTok Ads)
  - Pixel IDs live in `store_settings` (editable at `/admin/settings`); the shared loader reads them at runtime.
- **Confirmed Core Events (client brief):**
  - `PageView`: Every page load.
  - `ViewContent`: Product Detail Page with Content Name, Category, Value, Currency (`PKR`).
  - `AddToCart`: When customer opens the COD checkout drawer.
  - `Purchase`: When customer submits the COD order (order ID + value).
- **Optional extras (nice-to-have):** `InitiateCheckout` (form focus), `Contact` (floating WhatsApp click).
- **Ad Retargeting Goal:** Run low-cost retargeting ads to users who triggered `ViewContent` or `AddToCart` but didn't trigger `Purchase`.

---

## 7. Performance & Non-Functional Requirements

- **Speed:** Sub-1.5s First Contentful Paint (FCP) on 4G network.
- **Images:** Next-gen WebP/AVIF format with automatic responsive resizing.
- **Mobile First:** 90%+ traffic will be on Android/iOS smartphones.
- **Zero Ongoing Hosting Fees:** Architecture designed to run on free or extremely low-cost infrastructure.
