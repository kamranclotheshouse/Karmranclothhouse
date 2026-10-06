import { listCategories, productCountsBySlug } from '@/lib/db/catalogue';
import { TaxonomyManager, type TaxonomyRow } from '@/components/admin/TaxonomyManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const [categories, counts] = await Promise.all([
    listCategories(),
    productCountsBySlug('categories'),
  ]);

  const rows: TaxonomyRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    sub: c.sub,
    description: c.description,
    image: c.image,
    isActive: c.isActive,
    isFeatured: false,
    sortOrder: c.sortOrder,
    productCount: counts[c.slug] ?? 0,
  }));

  return <TaxonomyManager kind="category" rows={rows} />;
}
