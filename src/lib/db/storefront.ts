/**
 * Storefront reads — what the customer-facing pages ask the database for.
 *
 * Server-only: never import from a "use client" file. The lookups mirror
 * `@/lib/data` one-for-one, so a page can move off the static catalogue by
 * changing its import and adding `await` — nothing else.
 *
 * Pages built on this use `revalidate` (see each page) rather than
 * `force-dynamic`: a customer should get cached HTML, and an admin edit should
 * still show up within a minute without a redeploy.
 */
import { query } from './driver';
import {
  getProductBySlug,
  listBrands,
  listCategories,
  listProducts,
  listProductsByCategorySlug,
  searchProducts,
} from './catalogue';
import type { Brand, Category, Product } from '../data';

/** Every product, in `sort_order` order. */
export async function getAllProducts(): Promise<Product[]> {
  return listProducts();
}

export async function getProduct(slug: string): Promise<Product | null> {
  return getProductBySlug(slug);
}

/** Primary category OR any extra category via the product_categories join. */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return listProductsByCategorySlug(categorySlug);
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((p) => p.brandSlug === brandSlug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((p) => p.isFeatured);
}

export async function getBestsellerProducts(): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((p) => p.isBestseller);
}

/**
 * What the search box asks for: matching products first, then any category or
 * brand with the same word so a customer who typed "winter" also gets a way
 * into the Winter Collection.
 */
export interface SearchResults {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export async function searchStorefront(term: string, limit = 24): Promise<SearchResults> {
  const trimmed = term.trim();
  if (!trimmed) return { products: [], categories: [], brands: [] };

  const [products, categories, brands] = await Promise.all([
    searchProducts(trimmed, limit),
    getCategories(),
    getBrands(),
  ]);

  const needle = trimmed.toLowerCase();
  const matches = (haystack: string) => haystack.toLowerCase().includes(needle);

  return {
    products,
    categories: categories.filter((c) => matches(c.name) || matches(c.sub)),
    brands: brands.filter((b) => matches(b.name) || matches(b.tag)),
  };
}

/* ── Taxonomy ────────────────────────────────────────────────────────────── */

/** Only categories the admin has switched on. */
export async function getCategories(): Promise<Category[]> {
  const categories = await listCategories();
  return categories.filter((c) => c.isActive);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  const brands = await listBrands();
  return brands.filter((b) => b.isActive);
}

export async function getBrand(slug: string): Promise<Brand | null> {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug) ?? null;
}

/* ── Build-time helpers ──────────────────────────────────────────────────── */

/** Slugs only — cheap enough to call from `generateStaticParams`. */
export async function listProductSlugs(): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    'SELECT slug FROM products ORDER BY sort_order ASC, title ASC'
  );
  return rows.map((r) => r.slug);
}

export async function listTaxonomySlugs(kind: 'brands' | 'categories'): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    `SELECT slug FROM ${kind} WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC`
  );
  return rows.map((r) => r.slug);
}
