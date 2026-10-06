# 🗄️ Database Schema & Architecture

## Project: Kamran Cloth House
Target Database: **PostgreSQL (Neon serverless)** — live DDL in [`db/schema.sql`](./db/schema.sql)

---

## 1. Entity Relationship (ER) Overview

```
 ┌──────────────┐          ┌────────────────┐          ┌────────────────┐
 │    Brands    │◄────┐    │   Categories   │◄────┐    │    Banners     │
 └──────────────┘     │    └────────────────┘     │    └────────────────┘
                      │                           │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │      Products      │
                         │ (Colors & Variants)│
                         └──────────┬─────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │       Orders       │
                         │(Cash on Delivery)  │
                         └────────────────────┘
```

---

## 2. Complete SQL DDL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BRANDS TABLE (~30 shortlisted brands)
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    logo_url TEXT,
    tagline VARCHAR(255),
    description TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    urdu_title VARCHAR(150),
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    description TEXT,
    
    -- Fabric Specific Specifications
    fabric_type VARCHAR(120),          -- e.g. '100% Giza Cotton', 'Pure Wool Blend', 'Karandi'
    fabric_length VARCHAR(80) DEFAULT '4.0 Meters Suit Piece', -- e.g. '4.0 Meters' or '4.5 Meters'
    fabric_width VARCHAR(80) DEFAULT '54 Inches (Bara Bahr)',
    season VARCHAR(50),                -- 'Winter', 'Summer', 'All-Season', 'Four-Season'
    weave_type VARCHAR(100),           -- 'Plain Weave', 'Twill', 'Jacquard', 'Herringbone'
    
    -- Pricing
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),   -- Original price for sale discount badge
    is_price_on_inquiry BOOLEAN DEFAULT false, -- For exclusive royal wedding fabrics
    
    -- Stock & Visibility
    is_in_stock BOOLEAN DEFAULT true,
    stock_quantity INT DEFAULT 50,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    
    -- Media (Array of Image URLs)
    images TEXT[] NOT NULL DEFAULT '{}',
    
    -- Color Variants as JSON Array
    -- Format: [{"name": "Royal Emerald", "hex": "#062E22", "image": "url", "in_stock": true}]
    color_variants JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ORDERS TABLE (Cash on Delivery Focused)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'KCH-1001'
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_whatsapp VARCHAR(30),
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Financials
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_charges NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery (COD)',
    
    -- Order Status Workflow
    -- 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'
    order_status VARCHAR(50) DEFAULT 'pending',
    
    -- Order Items JSON Array
    -- [{"product_id": "...", "title": "...", "color": "Navy", "quantity": 1, "price": 4500, "image": "..."}]
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    customer_notes TEXT,
    admin_notes TEXT,
    tracking_number VARCHAR(100),
    courier_name VARCHAR(100), -- 'TCS', 'Trax', 'Leopards', 'PostEx'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BANNERS TABLE — hero carousel slides + promo/winter banner + announcement
--    (matches db/schema.sql: placement in 'hero','announcement','promo')
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement VARCHAR(30) NOT NULL DEFAULT 'hero'
              CHECK (placement IN ('hero','announcement','promo')),
    image_url TEXT,                     -- required for placement='hero'
    eyebrow VARCHAR(120),               -- e.g. 'Shafi Market · Saddar · Peshawar'
    title_line1 VARCHAR(120),
    title_line2 VARCHAR(120),
    subtitle TEXT,
    cta_text VARCHAR(80),               -- primary button label
    cta_link VARCHAR(255),              -- primary button href
    cta_secondary_text VARCHAR(80),     -- secondary button label
    cta_secondary_link VARCHAR(255),    -- secondary button href
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STORE CONFIGURATION TABLE (single row, edited at /admin/settings)
CREATE TABLE store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name VARCHAR(150) DEFAULT 'Kamran Cloth House',
    logo_url TEXT,
    address TEXT,
    map_url TEXT,
    phone VARCHAR(50),
    landline VARCHAR(50),
    whatsapp_number VARCHAR(50),
    email VARCHAR(100),
    store_hours VARCHAR(200),
    instagram_url TEXT,
    facebook_url TEXT,
    tiktok_url TEXT,
    delivery_charge NUMERIC(10, 2) DEFAULT 250.00,
    free_delivery_threshold NUMERIC(10, 2) DEFAULT 5000.00,
    announcement_enabled BOOLEAN DEFAULT true,
    announcement_text TEXT,
    meta_pixel_id VARCHAR(50),
    tiktok_pixel_id VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PRODUCT ↔ CATEGORY JOIN TABLE (planned in Rebrand R5)
--    Groom pieces that belong to two categories (e.g. Astoor: Dulha Design
--    + Coat & Waistcoat) get a second row here; products.category_id stays
--    the primary/display category.
-- CREATE TABLE product_categories (
--     product_id UUID REFERENCES products(id) ON DELETE CASCADE,
--     category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
--     PRIMARY KEY (product_id, category_id)
-- );
```

---

## 3. Category List

**Target (6 categories — client brief, after Rebrand R5 reseed):**

1. **Cotton** (`slug: cotton`) — Egyptian, Pima, Supima, Giza
2. **Kapra / Wash-n-Wear** (`slug: kapra`) — general unstitched luxury fabric
3. **Winter Fabric** (`slug: winter-fabric`) — Wool, Marina, Karandi, Khaddar, Tweed
4. **Dulha (Groom) Design** (`slug: dulha-design`) — Sherwanis, Jamawar, embroidered
5. **Coat & Waistcoat** (`slug: coat-waistcoat`) — suiting + waistcoat brocades
6. **Shawls** (`slug: shawls`) — Pashmina, wool, embroidered shawls (variants = separate products)

**Current live seed (8 legacy categories, still in DB until R5):** the above minus
`coat-waistcoat`, plus `summer-fabric`, `coat-fabric`, `waistcoat-fabric` — these three
get purged in R5. Homepage already filters to the 6 new slugs.

---

## 4. Top 30 Pakistani Fabric Brands Seed List

1. Grace Fabrics
2. Pasha Fabrics
3. Gul Ahmed
4. Din Fabrics
5. Ahmad Fabrics
6. Rashid Fabrics
7. Al-Karam Studio
8. Sapphire Fabrics
9. J. (Junaid Jamshed)
10. Bonanza Satrangi
11. Edenrobe
12. MTJ (Maulana Tariq Jamil)
13. Sitara Textiles
14. Nishat Linen
15. Lawrencepur
16. Valika Woolen
17. Bannu Woolen
18. Harnai Woolen
19. Shaffer by Bareeze Man
20. Royal Velvet Fabrics
21. Kamalia Khaddar
22. Isfahan Fabrics
23. Moon Fabrics
24. Crown Fabrics
25. Imperial Textiles
26. Viceroy Fabrics
27. Dynasty Fabrics
28. Regent Fabrics
29. Sarena Fabrics
30. Kohinoor Mills
