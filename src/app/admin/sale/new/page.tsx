import { SaleBatchUploadForm } from '@/components/admin/SaleBatchUploadForm';
import { listBrands, listCategories } from '@/lib/db/catalogue';

export const dynamic = 'force-dynamic';

export default async function NewSaleProductsPage() {
  const [brands, categories] = await Promise.all([listBrands(), listCategories()]);
  return <SaleBatchUploadForm brands={brands} categories={categories} />;
}
