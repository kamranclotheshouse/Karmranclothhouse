-- ============================================================
-- Kamran Cloth House — Initial Schema (Neon / PostgreSQL)
-- Run this ONCE in the Neon SQL Editor (or via psql).
-- Seeding is done separately by `npm run db:seed`.
-- ============================================================

-- UUIDs come from gen_random_uuid(), built into PostgreSQL 13+.
-- No CREATE EXTENSION needed — keeps the schema portable across
-- Postgres, Neon, PGlite, or a plain psql session.

-- 1. BRANDS ---------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(150) NOT NULL UNIQUE,
    logo_url      TEXT,                 -- Cloudinary URL (leave null = text fallback)
    tagline       VARCHAR(255),
    description   TEXT,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES ------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    slug          VARCHAR(100) NOT NULL UNIQUE,
    subtitle      VARCHAR(150),         -- the short gold line under the title
    description   TEXT,
    image_url     TEXT,                 -- cover image shown on the category card
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRODUCTS --------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL UNIQUE,
    sku               VARCHAR(100),
    brand_id          UUID REFERENCES brands(id)    ON DELETE SET NULL,
    category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    description       TEXT,

    -- Fabric specs
    fabric_type       VARCHAR(120),
    fabric_length     VARCHAR(80)  DEFAULT '4.0 Meters Suit Piece',
    fabric_width      VARCHAR(80)  DEFAULT '54 Inches (Bara Bahr)',
    season            VARCHAR(50),
    weave_type        VARCHAR(100),

    -- Pricing
    price             NUMERIC(10,2) NOT NULL,
    compare_at_price  NUMERIC(10,2),
    price_on_inquiry  BOOLEAN NOT NULL DEFAULT false,

    -- Stock & merchandising
    is_in_stock       BOOLEAN NOT NULL DEFAULT true,
    stock_quantity    INT NOT NULL DEFAULT 50,
    is_featured       BOOLEAN NOT NULL DEFAULT false,
    is_bestseller     BOOLEAN NOT NULL DEFAULT false,
    badge             VARCHAR(60),      -- 'New Arrival', 'Bestseller', ...

    -- Media — ARRAY ORDER IS DISPLAY ORDER. images[0] is the hero/thumbnail.
    images            TEXT[] NOT NULL DEFAULT '{}',
    image_alt         VARCHAR(255),     -- SEO alt text for the hero image

    -- [{"name":"Royal Emerald","hex":"#062E22","image":"url","inStock":true}]
    -- Shape matches ColorVariant in src/lib/types.ts — camelCase keys.
    color_variants    JSONB NOT NULL DEFAULT '[]'::jsonb,

    sort_order        INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3b. PRODUCT ↔ CATEGORY — extra categories for dual-listed products -------
-- The product's main category stays in products.category_id (used for sort
-- order); this table carries the ADDITIONAL category (e.g. Astoor appears in
-- both Cotton and Kapra). Seeded from data.ts `alsoIn`, edited in admin
-- product form ("Also appears in").
CREATE TABLE IF NOT EXISTS product_categories (
    product_id  UUID NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 4. ORDERS (Cash on Delivery) ---------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number       VARCHAR(50) NOT NULL UNIQUE,   -- KCH-1001
    customer_name      VARCHAR(150) NOT NULL,
    customer_phone     VARCHAR(30)  NOT NULL,
    customer_whatsapp  VARCHAR(30),
    delivery_address   TEXT NOT NULL,
    city               VARCHAR(100) NOT NULL,

    subtotal           NUMERIC(10,2) NOT NULL,
    delivery_charges   NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount       NUMERIC(10,2) NOT NULL,
    payment_method     VARCHAR(50)  NOT NULL DEFAULT 'Cash on Delivery (COD)',

    order_status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
        CHECK (order_status IN ('pending','confirmed','dispatched','delivered','returned','cancelled')),

    -- [{"product_id":"...","title":"...","color":"Navy","quantity":1,"price":4500,"image":"..."}]
    items              JSONB NOT NULL DEFAULT '[]'::jsonb,

    customer_notes     TEXT,
    admin_notes        TEXT,
    courier_name       VARCHAR(100),     -- 'TCS', 'Trax', 'Leopards', 'PostEx'
    tracking_number    VARCHAR(100),

    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Additive shipment fields for databases created before courier tracking was added.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_status_check
    CHECK (order_status IN ('pending','confirmed','dispatched','delivered','returned','cancelled'));

-- Monotonic order numbers: KCH-1001, KCH-1002, ...
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- 5. BANNERS (hero slides + announcement) ----------------------
CREATE TABLE IF NOT EXISTS banners (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement     VARCHAR(30) NOT NULL DEFAULT 'hero'
                  CHECK (placement IN ('hero','announcement','promo')),
    image_url     TEXT,                 -- required for placement='hero'
    eyebrow       VARCHAR(120),         -- 'Shafi Market · Saddar · Peshawar'
    title_line1   VARCHAR(120),
    title_line2   VARCHAR(120),
    subtitle      TEXT,
    cta_text      VARCHAR(80),
    cta_link      VARCHAR(255),
    cta_secondary_text VARCHAR(80),
    cta_secondary_link VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Additive for databases created before the second hero button existed.
ALTER TABLE banners ADD COLUMN IF NOT EXISTS cta_secondary_text VARCHAR(80);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS cta_secondary_link VARCHAR(255);

-- 6. STORE CONFIGURATION (single row, id = 1) ------------------
CREATE TABLE IF NOT EXISTS store_settings (
    id                       INT PRIMARY KEY DEFAULT 1,
    store_name               VARCHAR(150) NOT NULL DEFAULT 'Kamran Cloth House',
    logo_url                 TEXT,
    address                  TEXT,
    map_url                  TEXT,
    phone                    VARCHAR(50),   -- mobile
    landline                 VARCHAR(50),
    whatsapp_number          VARCHAR(50),   -- international, no '+'
    email                    VARCHAR(100),
    store_hours              TEXT,          -- 'Mon–Sat: 11am–9pm · Friday: 4pm–9pm'
    instagram_url            TEXT,
    facebook_url             TEXT,
    tiktok_url               TEXT,
    delivery_charge          NUMERIC(10,2) NOT NULL DEFAULT 250,
    free_delivery_threshold  NUMERIC(10,2) NOT NULL DEFAULT 5000,
    announcement_enabled     BOOLEAN NOT NULL DEFAULT true,
    announcement_text        TEXT,
    meta_pixel_id            VARCHAR(50),
    tiktok_pixel_id          VARCHAR(50),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO store_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 7. PAGE CONTENT (about / delivery / returns / contact / home) -
CREATE TABLE IF NOT EXISTS page_content (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(40) NOT NULL UNIQUE
                CHECK (slug IN ('home','about','contact','delivery','returns')),
    title       VARCHAR(200) NOT NULL,
    intro       TEXT,
    -- [{"heading":"...","body":"...","icon":"..."}]
    sections    JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand      ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured) WHERE is_featured;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller;
CREATE INDEX IF NOT EXISTS idx_products_in_stock   ON products(is_in_stock);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_phone        ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banners_placement   ON banners(placement, sort_order);

-- updated_at triggers
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['brands','categories','products','orders','banners','page_content'] LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_touch_%1$s ON %1$s;
             CREATE TRIGGER trg_touch_%1$s BEFORE UPDATE ON %1$s
                 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();', t);
    END LOOP;
    -- store_settings has no updated_at trigger loop entry; add explicitly
    EXECUTE 'DROP TRIGGER IF EXISTS trg_touch_store_settings ON store_settings;
             CREATE TRIGGER trg_touch_store_settings BEFORE UPDATE ON store_settings
                 FOR EACH ROW EXECUTE FUNCTION touch_updated_at();';
END $$;
