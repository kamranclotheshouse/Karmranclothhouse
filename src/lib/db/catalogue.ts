/**
 * Catalogue data access — the only place that speaks SQL about
 * brands / categories / products.
 *
 * Server-only: never import from a "use client" file.
 */
import { query } from './driver';
import type { ColorVariant, Product } from '../data';

/* ── Row shapes (snake_case, straight off the wire) ──────────────────────── */

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  brand_id: string | null;
  category_id: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  category_name: string | null;
  category_slug: string | null;
  description: string | null;
  fabric_type: string | null;
  fabric_length: string | null;
  fabric_width: string | null;
  season: string | null;
  weave_type: string | null;
  price: string | number;
  compare_at_price: string | number | null;
  price_on_inquiry: boolean;
  is_in_stock: boolean;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  badge: string | null;
  images: string[];
  image_alt: string | null;
  color_variants: ColorVariant[];
  sort_order: number;
}

export interface AdminProduct extends Product {
  id: string;
  sku?: string;
  isInStock: boolean;
  stockQuantity: number;
  priceOnInquiry: boolean;
  imageAlt?: string;
  sortOrder: number;
}

const PRODUCT_SELECT = `
  SELECT p.id, p.title, p.slug, p.sku,
         p.brand_id, p.category_id,
         b.name AS brand_name, b.slug AS brand_slug,
         c.name AS category_name, c.slug AS category_slug,
         p.description, p.fabric_type, p.fabric_length, p.fabric_width,
         p.season, p.weave_type,
         p.price, p.compare_at_price, p.price_on_inquiry,
         p.is_in_stock, p.stock_quantity,
         p.is_featured, p.is_bestseller, p.badge,
         p.images, p.image_alt, p.color_variants, p.sort_order
    FROM products p
    LEFT JOIN brands     b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
`;

/* ── Mappers ─────────────────────────────────────────────────────────────── */

const num = (value: string | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const str = (value: string | null | undefined): string | undefined =>
  value === null || value === undefined || value === '' ? undefined : value;

function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    brand: row.brand_name ?? '',
    brandSlug: row.brand_slug ?? '',
    category: row.category_name ?? '',
    categorySlug: row.category_slug ?? '',
    price: num(row.price),
    compareAtPrice: row.compare_at_price === null ? undefined : num(row.compare_at_price),
    badge: str(row.badge),
    fabricType: row.fabric_type ?? '',
    length: row.fabric_length ?? '',
    width: row.fabric_width ?? '',
    season: row.season ?? '',
    weaveType: row.weave_type ?? '',
    description: row.description ?? '',
    colors: Array.isArray(row.color_variants) ? row.color_variants : [],
    images: Array.isArray(row.images) ? row.images : [],
    isFeatured: row.is_featured,
    isBestseller: row.is_bestseller,
    sku: row.sku ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    stockQuantity: row.stock_quantity,
    isInStock: row.is_in_stock,
    priceOnInquiry: row.price_on_inquiry,
    sortOrder: row.sort_order,
  };
}

/** Public shape — drops admin-only bookkeeping, but keeps `isInStock` because
 *  the product page needs it to decide whether the buy button is live. */
export function toPublicProduct(row: ProductRow): Product {
  const admin = toAdminProduct(row);
  const { id, stockQuantity, priceOnInquiry, sortOrder, ...product } = admin;
  void id;
  void stockQuantity;
  void priceOnInquiry;
  void sortOrder;
  return product;
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

export class NotFoundError extends Error {
  constructor(id: string) {
    super(`No product with id ${id}`);
    this.name = 'NotFoundError';
  }
}

export async function listProducts(): Promise<AdminProduct[]> {
  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT} ORDER BY p.sort_order ASC, p.title ASC`
  );
  return rows.map(toAdminProduct);
}

/** Products in a category — primary (products.category_id) OR extra
 *  (product_categories join), so dual-listed pieces like Astoor show up in
 *  both Cotton and Kapra. */
export async function listProductsByCategorySlug(categorySlug: string): Promise<AdminProduct[]> {
  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
      WHERE p.category_id = (SELECT id FROM categories WHERE slug = $1)
         OR EXISTS (
              SELECT 1
                FROM product_categories pc
                JOIN categories c2 ON c2.id = pc.category_id
               WHERE pc.product_id = p.id AND c2.slug = $1
            )
      ORDER BY p.sort_order ASC, p.title ASC`,
    [categorySlug]
  );
  return rows.map(toAdminProduct);
}

/**
 * Free-text search across the words a customer would actually type: the
 * product title, its brand, its category and the description.
 *
 * `ILIKE` is enough at catalogue scale (hundreds of rows), and the pattern is
 * escaped so a literal `%` in a query can't match everything.
 */
export async function searchProducts(term: string, limit = 6): Promise<Product[]> {
  const escaped = term.trim().replace(/[\\%_]/g, (char) => `\\${char}`);
  if (!escaped) return [];

  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
      WHERE (p.title ILIKE $1 OR p.description ILIKE $1
             OR b.name ILIKE $1 OR c.name ILIKE $1)
      ORDER BY p.sort_order ASC, p.title ASC
      LIMIT $2`,
    [`%${escaped}%`, limit]
  );
  return rows.map(toPublicProduct);
}

export async function getProductBySlug(slug: string): Promise<AdminProduct | null> {
  const rows = await query<ProductRow>(`${PRODUCT_SELECT} WHERE p.slug = $1`, [slug]);
  return rows.length ? toAdminProduct(rows[0]) : null;
}

/** Extra categories for a product (product_categories join) as slugs. */
export async function getProductExtraCategories(productId: string): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    `SELECT c.slug
       FROM product_categories pc
       JOIN categories c ON c.id = pc.category_id
      WHERE pc.product_id = $1
      ORDER BY c.sort_order ASC, c.name ASC`,
    [productId]
  );
  return rows.map((r) => r.slug);
}

/** Replace a product's extra categories. The primary category is ignored. */
export async function setProductExtraCategories(
  productId: string,
  categorySlugs: string[]
): Promise<void> {
  await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
  const primaryRows = await query<{ category_id: string | null }>(
    'SELECT category_id FROM products WHERE id = $1',
    [productId]
  );
  const primaryId = primaryRows.length ? primaryRows[0].category_id : null;
  const seen = new Set<string>();

  for (const slug of categorySlugs) {
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const id = await resolveId('categories', slug);
    if (!id || id === primaryId) continue;
    await query(
      `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [productId, id]
    );
  }
}

export async function getProductById(id: string): Promise<AdminProduct | null> {
  const rows = await query<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
  if (!rows.length) return null;
  const product = toAdminProduct(rows[0]);
  const extras = await getProductExtraCategories(id);
  return extras.length ? { ...product, alsoIn: extras } : product;
}

/** Every field is optional — only what is present in a patch gets written. */
export interface ProductPatch {
  title?: string;
  slug?: string;
  sku?: string | null;
  brandSlug?: string | null;
  categorySlug?: string | null;
  description?: string | null;
  fabricType?: string | null;
  fabricLength?: string | null;
  fabricWidth?: string | null;
  season?: string | null;
  weaveType?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  priceOnInquiry?: boolean;
  isInStock?: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  badge?: string | null;
  images?: string[];
  imageAlt?: string | null;
  colorVariants?: ColorVariant[];
  sortOrder?: number;
}

/** Create payload — the three fields a product cannot exist without. */
export interface ProductInput extends ProductPatch {
  title: string;
  slug: string;
  price: number;
}

async function resolveId(table: 'brands' | 'categories', slug?: string | null): Promise<string | null> {
  if (!slug) return null;
  const rows = await query<{ id: string }>(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
  return rows.length ? rows[0].id : null;
}

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
  const brandId = await resolveId('brands', input.brandSlug);
  const categoryId = await resolveId('categories', input.categorySlug);

  const rows = await query<{ id: string }>(
    `INSERT INTO products (
       title, slug, sku, brand_id, category_id, description,
       fabric_type, fabric_length, fabric_width, season, weave_type,
       price, compare_at_price, price_on_inquiry,
       is_in_stock, stock_quantity, is_featured, is_bestseller, badge,
       images, image_alt, color_variants, sort_order
     ) VALUES (
       $1,$2,$3,$4,$5,$6,
       $7,$8,$9,$10,$11,
       $12,$13,$14,
       $15,$16,$17,$18,$19,
       $20,$21,$22,$23
     )
     RETURNING id`,
    [
      input.title,
      input.slug,
      input.sku ?? null,
      brandId,
      categoryId,
      input.description ?? null,
      input.fabricType ?? null,
      input.fabricLength ?? null,
      input.fabricWidth ?? null,
      input.season ?? null,
      input.weaveType ?? null,
      input.price,
      input.compareAtPrice ?? null,
      input.priceOnInquiry ?? false,
      input.isInStock ?? true,
      input.stockQuantity ?? 50,
      input.isFeatured ?? false,
      input.isBestseller ?? false,
      input.badge ?? null,
      input.images ?? [],
      input.imageAlt ?? null,
      JSON.stringify(input.colorVariants ?? []),
      input.sortOrder ?? 0,
    ]
  );

  const created = await getProductById(rows[0].id);
  if (!created) throw new Error('Product was created but could not be read back');
  return created;
}

/** Partial update — only the keys present in `patch` are written. */
export async function updateProduct(id: string, patch: ProductPatch): Promise<AdminProduct> {
  const brandId = patch.brandSlug === undefined ? undefined : await resolveId('brands', patch.brandSlug);
  const categoryId =
    patch.categorySlug === undefined ? undefined : await resolveId('categories', patch.categorySlug);

  const sets: string[] = [];
  const params: unknown[] = [];
  const set = (column: string, value: unknown) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (patch.title !== undefined) set('title', patch.title);
  if (patch.slug !== undefined) set('slug', patch.slug);
  if (patch.sku !== undefined) set('sku', patch.sku);
  if (brandId !== undefined) set('brand_id', brandId);
  if (categoryId !== undefined) set('category_id', categoryId);
  if (patch.description !== undefined) set('description', patch.description);
  if (patch.fabricType !== undefined) set('fabric_type', patch.fabricType);
  if (patch.fabricLength !== undefined) set('fabric_length', patch.fabricLength);
  if (patch.fabricWidth !== undefined) set('fabric_width', patch.fabricWidth);
  if (patch.season !== undefined) set('season', patch.season);
  if (patch.weaveType !== undefined) set('weave_type', patch.weaveType);
  if (patch.price !== undefined) set('price', patch.price);
  if (patch.compareAtPrice !== undefined) set('compare_at_price', patch.compareAtPrice);
  if (patch.priceOnInquiry !== undefined) set('price_on_inquiry', patch.priceOnInquiry);
  if (patch.isInStock !== undefined) set('is_in_stock', patch.isInStock);
  if (patch.stockQuantity !== undefined) set('stock_quantity', patch.stockQuantity);
  if (patch.isFeatured !== undefined) set('is_featured', patch.isFeatured);
  if (patch.isBestseller !== undefined) set('is_bestseller', patch.isBestseller);
  if (patch.badge !== undefined) set('badge', patch.badge);
  if (patch.images !== undefined) set('images', patch.images);
  if (patch.imageAlt !== undefined) set('image_alt', patch.imageAlt);
  if (patch.colorVariants !== undefined) set('color_variants', JSON.stringify(patch.colorVariants));
  if (patch.sortOrder !== undefined) set('sort_order', patch.sortOrder);

  if (sets.length === 0) {
    const unchanged = await getProductById(id);
    if (!unchanged) throw new NotFoundError(id);
    return unchanged;
  }

  params.push(id);
  // RETURNING makes "no rows" unambiguous: it means the id did not match.
  const rows = await query<{ id: string }>(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (rows.length === 0) throw new NotFoundError(id);

  const updated = await getProductById(id);
  if (!updated) throw new NotFoundError(id);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const rows = await query<{ id: string }>(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);
  if (rows.length === 0) throw new NotFoundError(id);
}

/* ── Lookups used by the product form ────────────────────────────────────── */

/** Everything the admin needs to edit a category, in display order. */
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  sub: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  tag: string;
  description: string;
  logo: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount?: number;
}

const CATEGORY_SELECT = `
  SELECT categories.id, categories.name, categories.slug, categories.subtitle,
         categories.description, categories.image_url,
         categories.is_active, categories.sort_order
    FROM categories
`;

const BRAND_SELECT = `
  SELECT brands.id, brands.name, brands.slug, brands.tagline, brands.description,
         brands.logo_url, brands.is_active, brands.is_featured, brands.sort_order
    FROM brands
`;

export async function listCategories(): Promise<AdminCategory[]> {
  const rows = await query<{
    id: string;
    name: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
  }>(`${CATEGORY_SELECT} ORDER BY categories.sort_order ASC, categories.name ASC`);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sub: row.subtitle ?? '',
    description: row.description ?? '',
    image: row.image_url ?? '',
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }));
}

export async function listBrands(): Promise<AdminBrand[]> {
  const rows = await query<{
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    logo_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
  }>(`${BRAND_SELECT} ORDER BY brands.sort_order ASC, brands.name ASC`);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    tag: row.tagline ?? '',
    description: row.description ?? '',
    logo: row.logo_url ?? '',
    isActive: row.is_active,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
  }));
}

/* ── Taxonomy CRUD (admin) ───────────────────────────────────────────────── */

export type TaxonomyTable = 'brands' | 'categories';

async function findOne<T>(table: TaxonomyTable, id: string, sql: string): Promise<T | null> {
  const rows = await query<T>(`${sql} WHERE ${table}.id = $1`, [id]);
  return rows.length ? rows[0] : null;
}

export async function getCategoryById(id: string): Promise<AdminCategory | null> {
  const row = await findOne<{
    id: string;
    name: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
  }>('categories', id, CATEGORY_SELECT);
  return row
    ? {
        id: row.id,
        name: row.name,
        slug: row.slug,
        sub: row.subtitle ?? '',
        description: row.description ?? '',
        image: row.image_url ?? '',
        isActive: row.is_active,
        sortOrder: row.sort_order,
      }
    : null;
}

export async function getBrandById(id: string): Promise<AdminBrand | null> {
  const row = await findOne<{
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    logo_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
  }>('brands', id, BRAND_SELECT);
  return row
    ? {
        id: row.id,
        name: row.name,
        slug: row.slug,
        tag: row.tagline ?? '',
        description: row.description ?? '',
        logo: row.logo_url ?? '',
        isActive: row.is_active,
        isFeatured: row.is_featured,
        sortOrder: row.sort_order,
      }
    : null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  sub?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type CategoryPatch = Partial<CategoryInput>;

export async function createCategory(input: CategoryInput): Promise<AdminCategory> {
  const rows = await query<{ id: string }>(
    `INSERT INTO categories (name, slug, subtitle, description, image_url, is_active, sort_order)
     VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''), $6, $7)
     RETURNING id`,
    [
      input.name.trim(),
      input.slug.trim(),
      input.sub ?? '',
      input.description ?? '',
      input.image ?? '',
      input.isActive ?? true,
      input.sortOrder ?? 0,
    ]
  );
  const created = await getCategoryById(rows[0].id);
  if (!created) throw new NotFoundError(rows[0].id);
  return created;
}

export async function updateCategory(id: string, patch: CategoryPatch): Promise<AdminCategory> {
  const sets: string[] = [];
  const params: unknown[] = [];
  const set = (column: string, value: unknown) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (patch.name !== undefined) set('name', patch.name.trim());
  if (patch.slug !== undefined) set('slug', patch.slug.trim());
  if (patch.sub !== undefined) set('subtitle', patch.sub.trim() || null);
  if (patch.description !== undefined) set('description', patch.description.trim() || null);
  if (patch.image !== undefined) set('image_url', patch.image.trim() || null);
  if (patch.isActive !== undefined) set('is_active', patch.isActive);
  if (patch.sortOrder !== undefined) set('sort_order', patch.sortOrder);
  set('updated_at', new Date().toISOString());

  params.push(id);
  const rows = await query<{ id: string }>(
    `UPDATE categories SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (rows.length === 0) throw new NotFoundError(id);

  const updated = await getCategoryById(id);
  if (!updated) throw new NotFoundError(id);
  return updated;
}

/** Products keep existing — `products.category_id` is `ON DELETE SET NULL`. */
export async function deleteCategory(id: string): Promise<void> {
  const rows = await query<{ id: string }>(`DELETE FROM categories WHERE id = $1 RETURNING id`, [id]);
  if (rows.length === 0) throw new NotFoundError(id);
}

export interface BrandInput {
  name: string;
  slug: string;
  tag?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export type BrandPatch = Partial<BrandInput>;

export async function createBrand(input: BrandInput): Promise<AdminBrand> {
  const rows = await query<{ id: string }>(
    `INSERT INTO brands (name, slug, tagline, description, logo_url, is_active, is_featured, sort_order)
     VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''), $6, $7, $8)
     RETURNING id`,
    [
      input.name.trim(),
      input.slug.trim(),
      input.tag ?? '',
      input.description ?? '',
      input.logo ?? '',
      input.isActive ?? true,
      input.isFeatured ?? false,
      input.sortOrder ?? 0,
    ]
  );
  const created = await getBrandById(rows[0].id);
  if (!created) throw new NotFoundError(rows[0].id);
  return created;
}

export async function updateBrand(id: string, patch: BrandPatch): Promise<AdminBrand> {
  const sets: string[] = [];
  const params: unknown[] = [];
  const set = (column: string, value: unknown) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (patch.name !== undefined) set('name', patch.name.trim());
  if (patch.slug !== undefined) set('slug', patch.slug.trim());
  if (patch.tag !== undefined) set('tagline', patch.tag.trim() || null);
  if (patch.description !== undefined) set('description', patch.description.trim() || null);
  if (patch.logo !== undefined) set('logo_url', patch.logo.trim() || null);
  if (patch.isActive !== undefined) set('is_active', patch.isActive);
  if (patch.isFeatured !== undefined) set('is_featured', patch.isFeatured);
  if (patch.sortOrder !== undefined) set('sort_order', patch.sortOrder);
  set('updated_at', new Date().toISOString());

  params.push(id);
  const rows = await query<{ id: string }>(
    `UPDATE brands SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (rows.length === 0) throw new NotFoundError(id);

  const updated = await getBrandById(id);
  if (!updated) throw new NotFoundError(id);
  return updated;
}

/** Products keep existing — `products.brand_id` is `ON DELETE SET NULL`. */
export async function deleteBrand(id: string): Promise<void> {
  const rows = await query<{ id: string }>(`DELETE FROM brands WHERE id = $1 RETURNING id`, [id]);
  if (rows.length === 0) throw new NotFoundError(id);
}

/** How many products would lose this link — shown as a warning before delete. */
export async function countProductsIn(
  table: TaxonomyTable,
  slug: string
): Promise<number> {
  const column = table === 'brands' ? 'brand_id' : 'category_id';
  const rows = await query<{ id: string }>(
    `SELECT p.id FROM products p
       JOIN ${table} t ON t.id = p.${column}
      WHERE t.slug = $1`,
    [slug]
  );
  return rows.length;
}

/**
 * One query for the whole list, so the admin page can say "12 products" next
 * to every row without N round-trips.
 */
export async function productCountsBySlug(
  table: TaxonomyTable
): Promise<Record<string, number>> {
  const column = table === 'brands' ? 'brand_id' : 'category_id';
  const rows = await query<{ slug: string; n: string | number }>(
    `SELECT t.slug, COUNT(p.id) AS n
       FROM ${table} t
       LEFT JOIN products p ON p.${column} = t.id
      GROUP BY t.slug`
  );
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.slug] = Number(row.n);
  return counts;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Table names cannot be bound as parameters, so they are a literal union —
 * `slugIsTaken(slug)` keeps its original product-only meaning for existing
 * callers, and taxonomy routes pass their own table.
 */
export type SlugTable = 'products' | 'brands' | 'categories';

export async function slugIsTaken(
  slug: string,
  ignoreId?: string,
  table: SlugTable = 'products'
): Promise<boolean> {
  const rows = await query(
    `SELECT 1 FROM ${table} WHERE slug = $1${ignoreId ? ' AND id <> $2' : ''}`,
    ignoreId ? [slug, ignoreId] : [slug]
  );
  return rows.length > 0;
}
