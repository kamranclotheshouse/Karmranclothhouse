import Link from 'next/link';
import { ProductList } from '@/components/admin/ProductList';
import { listProducts } from '@/lib/db/catalogue';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  // A failed connection is rethrown so /admin/error.tsx renders it with a 500 —
  // a broken backend must not look like an empty catalogue.
  const products = await listProducts();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-heading">Products</h1>
          <p className="admin-subheading" style={{ marginBottom: 0 }}>
            {products.length} products in the catalogue.
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn">
          + Add Product
        </Link>
      </div>

      <ProductList products={products} />
    </>
  );
}
