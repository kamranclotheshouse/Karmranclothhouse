import { listBrands, productCountsBySlug } from '@/lib/db/catalogue';
import { TaxonomyManager, type TaxonomyRow } from '@/components/admin/TaxonomyManager';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const [brands, counts] = await Promise.all([
    listBrands(),
    productCountsBySlug('brands'),
  ]);

  const rows: TaxonomyRow[] = brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    sub: b.tag,
    description: b.description,
    image: b.logo,
    isActive: b.isActive,
    isFeatured: b.isFeatured,
    sortOrder: b.sortOrder,
    productCount: counts[b.slug] ?? 0,
  }));

  return <TaxonomyManager kind="brand" rows={rows} />;
}
