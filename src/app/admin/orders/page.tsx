import { listOrders } from '@/lib/db/orders';
import { getStoreSettings } from '@/lib/db/settings';
import { OrdersList } from '@/components/admin/OrdersList';

export const dynamic = 'force-dynamic';

/**
 * Server component: the order list is read straight from the database, so the
 * panel shows real orders on first paint and works for whoever is signed in on
 * any device. Filtering and status changes happen in `OrdersList`.
 */
export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([listOrders({ limit: 200 }), getStoreSettings()]);
  return <OrdersList orders={orders} settings={settings} />;
}
