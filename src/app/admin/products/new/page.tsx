import { ProductForm } from '@/components/admin/ProductForm';
import { listBrands, listCategories } from '@/lib/db/catalogue';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([listBrands(), listCategories()]);
  return <ProductForm product={null} brands={brands} categories={categories} />;
}
