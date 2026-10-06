/**
 * Seed core — driver-agnostic.
 *
 * Takes a `query(sql, params)` function so the exact same code can run against
 * Neon (scripts/seed.ts) or an in-process PGlite (scripts/verify-db.ts) without
 * duplicating a single INSERT.
 *
 * Idempotent: every row is upserted on its natural key (slug), so running twice
 * never duplicates anything and never clobbers ids that other tables reference.
 */
import { brands, categories, products } from '../data';
import { DEFAULT_HERO_CONTENT } from '../hero';

export type QueryResult = { rows: Record<string, unknown>[] };
export type QueryFn = (sql: string, params?: unknown[]) => Promise<QueryResult>;

export interface SeedReport {
  brands: number;
  categories: number;
  products: number;
  bannerId: string | null;
  promoId: string | null;
}

export async function seed(query: QueryFn): Promise<SeedReport> {
  // ── Brands ───────────────────────────────────────────────────────────────
  const brandIdBySlug = new Map<string, string>();

  for (const [index, brand] of brands.entries()) {
    const result = await query(
      `INSERT INTO brands (name, slug, tagline, sort_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             tagline = EXCLUDED.tagline,
             sort_order = EXCLUDED.sort_order,
             updated_at = NOW()
       RETURNING id`,
      [brand.name, brand.slug, brand.tag, index]
    );
    brandIdBySlug.set(brand.slug, String(result.rows[0].id));
  }

  // ── Categories ───────────────────────────────────────────────────────────
  const categoryIdBySlug = new Map<string, string>();

  for (const [index, category] of categories.entries()) {
    const result = await query(
      `INSERT INTO categories (name, slug, subtitle, description, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             subtitle = EXCLUDED.subtitle,
             description = EXCLUDED.description,
             image_url = EXCLUDED.image_url,
             sort_order = EXCLUDED.sort_order,
             updated_at = NOW()
       RETURNING id`,
      [
        category.name,
        category.slug,
        category.sub,
        category.description,
        category.image,
        index,
      ]
    );
    categoryIdBySlug.set(category.slug, String(result.rows[0].id));
  }

  // ── Products ─────────────────────────────────────────────────────────────
  for (const [index, product] of products.entries()) {
    const brandId = brandIdBySlug.get(product.brandSlug) ?? null;
    const categoryId = categoryIdBySlug.get(product.categorySlug) ?? null;

    await query(
      `INSERT INTO products (
         title, slug, brand_id, category_id, description,
         fabric_type, fabric_length, fabric_width, season, weave_type,
         price, compare_at_price,
         is_featured, is_bestseller, badge,
         images, color_variants, sort_order
       ) VALUES ($1,$2,$3,$4,$5, $6,$7,$8,$9,$10, $11,$12, $13,$14,$15, $16,$17,$18)
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             brand_id = EXCLUDED.brand_id,
             category_id = EXCLUDED.category_id,
             description = EXCLUDED.description,
             fabric_type = EXCLUDED.fabric_type,
             fabric_length = EXCLUDED.fabric_length,
             fabric_width = EXCLUDED.fabric_width,
             season = EXCLUDED.season,
             weave_type = EXCLUDED.weave_type,
             price = EXCLUDED.price,
             compare_at_price = EXCLUDED.compare_at_price,
             is_featured = EXCLUDED.is_featured,
             is_bestseller = EXCLUDED.is_bestseller,
             badge = EXCLUDED.badge,
             images = EXCLUDED.images,
             color_variants = EXCLUDED.color_variants,
             sort_order = EXCLUDED.sort_order,
             updated_at = NOW()`,
      [
        product.name,
        product.slug,
        brandId,
        categoryId,
        product.description,
        product.fabricType,
        product.length,
        product.width,
        product.season,
        product.weaveType,
        product.price,
        product.compareAtPrice ?? null,
        product.isFeatured ?? false,
        product.isBestseller ?? false,
        product.badge ?? null,
        product.images,
        JSON.stringify(product.colors),
        index,
      ]
    );
  }

  // ── Purge rows that are no longer in data.ts ─────────────────────────────
  // Pre-launch: data.ts is the single catalogue source of truth, so anything
  // the old seed created (or anything stale) is removed. Once the client runs
  // the store from the admin panel, STOP running db:seed.
  const knownProductSlugs = new Set(products.map((p) => p.slug));
  const existingProducts = await query('SELECT slug FROM products');
  for (const row of existingProducts.rows) {
    const slug = String(row.slug);
    if (!knownProductSlugs.has(slug)) {
      await query('DELETE FROM products WHERE slug = $1', [slug]);
    }
  }

  const knownCategorySlugs = new Set(categories.map((c) => c.slug));
  const existingCategories = await query('SELECT slug FROM categories');
  for (const row of existingCategories.rows) {
    const slug = String(row.slug);
    if (!knownCategorySlugs.has(slug)) {
      await query('DELETE FROM categories WHERE slug = $1', [slug]);
    }
  }

  const knownBrandSlugs = new Set(brands.map((b) => b.slug));
  const existingBrands = await query('SELECT slug FROM brands');
  for (const row of existingBrands.rows) {
    const slug = String(row.slug);
    if (!knownBrandSlugs.has(slug)) {
      await query('DELETE FROM brands WHERE slug = $1', [slug]);
    }
  }

  // ── product_categories — extra categories (Astoor, Silky Joy) ────────────
  await query('DELETE FROM product_categories');
  for (const product of products) {
    if (!product.alsoIn?.length) continue;
    const idResult = await query('SELECT id FROM products WHERE slug = $1', [product.slug]);
    if (idResult.rows.length === 0) continue;
    const productId = String(idResult.rows[0].id);
    for (const catSlug of product.alsoIn) {
      const categoryId = categoryIdBySlug.get(catSlug);
      if (!categoryId) continue;
      await query(
        `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [productId, categoryId]
      );
    }
  }

  // ── Store settings (row is created by schema.sql) ────────────────────────
  await query(
    `UPDATE store_settings
        SET address = $1,
            phone = $2,
            landline = $3,
            whatsapp_number = $4,
            email = $5,
            store_hours = $6,
            delivery_charge = $7,
            free_delivery_threshold = $8,
            announcement_enabled = $9,
            announcement_text = $10,
            map_url = $11,
            instagram_url = $12,
            facebook_url = $13,
            tiktok_url = $14,
            updated_at = NOW()
      WHERE id = 1`,
    [
      'Main Tipu Sultan Road, Shafi Bazar, Bangash Market, Shop #1, Saddar Peshawar',
      '+92 333 4764131',
      '',
      '923334764131',
      'info@kamrancloth.pk',
      'Mon–Sat: 11am – 9pm  ·  Friday: 4pm – 9pm',
      250,
      5000,
      true,
      'Free Delivery on Orders above Rs. 5,000  |  Cash on Delivery Across Pakistan  |  Shafi Market, Saddar Peshawar',
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4496.708976789593!2d71.52786347847184!3d33.99806046471546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917bd55ff0293%3A0x6f47c3a85f89da7a!2sShafi%20Market!5e0!3m2!1sen!2s!4v1791213836475!5m2!1sen!2s',
      'https://www.instagram.com/kamran.cloth.house_7',
      'https://www.facebook.com/profile.php?id=61594669430442',
      'https://www.tiktok.com/@kamranclothhouse7',
    ]
  );

  // ── Homepage hero (seeded once; existing rows are editable content, so a
  //    re-seed must never overwrite what the client typed) ──────────────────
  const existingHero = await query(
    `SELECT id FROM banners WHERE placement = 'hero' ORDER BY sort_order LIMIT 1`
  );
  let bannerId: string | null = null;

  if (existingHero.rows.length > 0) {
    bannerId = String(existingHero.rows[0].id);
  } else {
    for (const [index, hero] of DEFAULT_HERO_CONTENT.slides.entries()) {
      const result = await query(
        `INSERT INTO banners (placement, image_url, eyebrow, title_line1, title_line2, subtitle,
                              cta_text, cta_link, cta_secondary_text, cta_secondary_link, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          'hero',
          hero.imageUrl,
          hero.eyebrow,
          hero.titleLine1,
          hero.titleLine2,
          hero.subtitle,
          hero.ctaPrimaryLabel,
          hero.ctaPrimaryHref,
          hero.ctaSecondaryLabel,
          hero.ctaSecondaryHref,
          index,
        ]
      );
      if (index === 0) bannerId = String(result.rows[0].id);
    }
  }

  // ── Winter/promo banner (seeded once, never overwritten on re-seed) ──────
  const existingPromo = await query(
    `SELECT id FROM banners WHERE placement = 'promo' LIMIT 1`
  );
  let promoId: string | null = null;

  if (existingPromo.rows.length > 0) {
    promoId = String(existingPromo.rows[0].id);
  } else {
    const promoResult = await query(
      `INSERT INTO banners (placement, image_url, eyebrow, title_line1, title_line2, subtitle,
                            cta_text, cta_link, cta_secondary_text, cta_secondary_link, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        'promo',
        '/images/winter-fabric.jpg',
        'Winter Collection 2026',
        'Winter Fabric',
        'Warmth, Woven Right',
        'Karandi, khaddar aur wool shawls — Peshawar ki sardi ke liye tayyar.',
        'Shop Winter Collection',
        '/categories/winter-fabric',
        'View All Winter',
        '/categories/winter-fabric',
        0,
      ]
    );
    promoId = String(promoResult.rows[0].id);
  }

  return {
    brands: brands.length,
    categories: categories.length,
    products: products.length,
    bannerId,
    promoId,
  };
}
