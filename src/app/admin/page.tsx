import Link from 'next/link';
import { listOrders } from '@/lib/db/orders';
import type { Order } from '@/lib/orders';

export const dynamic = 'force-dynamic';

function formatMoney(n: number): string {
  return `Rs. ${n.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

function summarise(orders: Order[]) {
  const pending = orders.filter((o) => o.status === 'pending');
  const delivered = orders.filter((o) => o.status === 'delivered');
  return {
    pending,
    delivered,
    revenue: delivered.reduce((sum, o) => sum + o.totalAmount, 0),
    openValue: pending.reduce((sum, o) => sum + o.totalAmount, 0),
  };
}

export default async function AdminDashboardPage() {
  const orders = await listOrders({ limit: 500 });
  const stats = summarise(orders);
  const recent = orders.slice(0, 5);

  return (
    <>
      <h1 className="admin-heading">Dashboard</h1>
      <p className="admin-subheading">
        Today&apos;s orders, fulfilment queue and revenue at a glance.
      </p>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-label">Pending Orders</span>
          <span className="admin-stat-value">{stats.pending.length}</span>
          <span className="admin-stat-note">{formatMoney(stats.openValue)} awaiting confirmation</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Total Orders</span>
          <span className="admin-stat-value">{orders.length}</span>
          <span className="admin-stat-note">All time, every device</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Delivered</span>
          <span className="admin-stat-value">{stats.delivered.length}</span>
          <span className="admin-stat-note">Completed COD orders</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Delivered Value</span>
          <span className="admin-stat-value" style={{ fontSize: 22 }}>
            {formatMoney(stats.revenue)}
          </span>
          <span className="admin-stat-note">Cash collected</span>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Recent Orders</h2>
          <Link href="/admin/orders" className="admin-btn admin-btn--ghost admin-btn--sm">
            View All
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="admin-empty">
            No orders yet. Place a test order from the storefront and it will appear here instantly.
          </p>
        ) : (
          recent.map((order) => (
            <div className="admin-order" key={order.orderNumber}>
              <div className="admin-order-top">
                <span className="admin-order-id">{order.orderNumber}</span>
                <span className="admin-badge" data-status={order.status}>
                  {order.status}
                </span>
              </div>
              <div className="admin-order-line">
                <span>{order.customerName}</span>
                <span>{order.customerPhone}</span>
                <span>{order.city}</span>
                <span className="admin-order-total">{formatMoney(order.totalAmount)}</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Quick Actions</h2>
        </div>
        <div className="admin-panel-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/admin/orders" className="admin-btn admin-btn--sm">
            Fulfil Orders
          </Link>
          <Link href="/admin/products" className="admin-btn admin-btn--ghost admin-btn--sm">
            Manage Stock
          </Link>
          <Link href="/" className="admin-btn admin-btn--ghost admin-btn--sm">
            View Storefront
          </Link>
        </div>
      </section>
    </>
  );
}
