import Link from 'next/link';
import { SaleProductList } from '@/components/admin/SaleProductList';
import { listSaleProducts } from '@/lib/db/catalogue';

export const dynamic = 'force-dynamic';

export default async function AdminSalePage() {
  const saleProducts = await listSaleProducts();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-heading">Sale Products</h1>
          <p className="admin-subheading" style={{ marginBottom: 0 }}>
            {saleProducts.length} products currently active on Sale.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/sale/new" className="admin-btn">
            + Upload Sale Products (Multi-Color)
          </Link>
        </div>
      </div>

      <SaleProductList products={saleProducts} />
    </>
  );
}
