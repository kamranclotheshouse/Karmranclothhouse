import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { getProductById, listBrands, listCategories } from '@/lib/db/catalogue';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // A database failure propagates to /admin/error.tsx (500); only a row that
  // genuinely does not exist becomes a 404.
  const [product, brands, categories] = await Promise.all([
    getProductById(id),
    listBrands(),
    listCategories(),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} brands={brands} categories={categories} />;
}
