import type { MetadataRoute } from 'next';
import { listProductSlugs, listTaxonomySlugs } from '@/lib/db/storefront';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kamranclothhouse.vercel.app';

/** Read on every request so new products/categories appear immediately. */
export const dynamic = 'force-dynamic';

const staticPages: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/categories', priority: 0.9 },
  { path: '/brands', priority: 0.8 },
  { path: '/tailoring', priority: 0.7 },
  { path: '/how-to-order', priority: 0.7 },
  { path: '/faq', priority: 0.6 },
  { path: '/delivery', priority: 0.6 },
  { path: '/returns', priority: 0.5 },
  { path: '/contact', priority: 0.7 },
  { path: '/about', priority: 0.6 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
  { path: '/track', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorySlugs, brandSlugs, productSlugs] = await Promise.all([
    listTaxonomySlugs('categories'),
    listTaxonomySlugs('brands'),
    listProductSlugs(),
  ]);

  return [
    ...staticPages.map((page) => ({
      url: `${BASE}${page.path}`,
      changeFrequency: 'weekly' as const,
      priority: page.priority,
    })),
    ...categorySlugs.map((slug) => ({
      url: `${BASE}/categories/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...brandSlugs.map((slug) => ({
      url: `${BASE}/brands/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...productSlugs.map((slug) => ({
      url: `${BASE}/product/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
