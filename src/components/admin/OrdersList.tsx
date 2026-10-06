'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCourierTrackingUrl, ORDER_STATUSES, type Order, type OrderStatus } from '@/lib/orders';
import type { StoreSettings } from '@/lib/settings';
import { notify } from '@/components/admin/ui';

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: 'Aap ka order receive ho gaya hai. Stock confirm karke jaldi update denge, InshaAllah.',
  confirmed: 'Aap ka order confirm ho gaya hai aur packing ke liye ready kiya ja raha hai.',
  dispatched: 'Your order {id} has been dispatched via TCS / Leopards. You will receive it in 2–5 working days.',
  delivered: 'Aap ka order deliver ho gaya hai. Kamran Cloth House se shopping ka shukriya!',
  returned: 'Aap ka order return process mein hai. Hamari team jald aap se rabta karegi.',
  cancelled: 'Aap ka order cancel kar diya gaya hai. Agar ye ghalti hai to humein WhatsApp par batayein.',
};

STATUS_MESSAGES.dispatched = 'Aap ka order dispatch ho gaya hai. Neeche courier aur tracking details di gayi hain.';

function formatMoney(n: number): string {
  return `Rs. ${n.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

function whatsappUpdateUrl(order: Order, status: OrderStatus, settings: StoreSettings): string {
  const message = STATUS_MESSAGES[status].replace('{id}', order.orderNumber);
  const legacy =
    `السلام علیکم ${order.customerName},\n\n` +
    `${message}\n\n` +
    `Order: ${order.orderNumber}\n` +
    `Total: ${formatMoney(order.totalAmount)} (Cash on Delivery)\n\n` +
    `${settings.storeName} · Saddar, Peshawar`;
  const items = order.items
    .map((item) => `• ${item.title}${item.color ? ` (${item.color})` : ''} × ${item.quantity}`)
    .join('\n');
  const trackingUrl = getCourierTrackingUrl(order.courierName, order.trackingNumber);
  const shipment = order.courierName && order.trackingNumber
    ? `\nCourier: ${order.courierName}\nTracking ID: ${order.trackingNumber}${trackingUrl ? `\nLive tracking: ${trackingUrl}` : ''}`
    : '';
  const full = [
    `Assalam-o-Alaikum ${order.customerName},`,
    '',
    message,
    '',
    `Order: ${order.orderNumber}`,
    'Items:',
    items,
    '',
    `Total: ${formatMoney(order.totalAmount)} (Cash on Delivery)`,
    shipment,
    '',
    `${settings.storeName} · Saddar, Peshawar`,
  ].join('\n');
  void legacy;
  return `https://wa.me/92${order.customerPhone.replace(/^0?3/, '3').replace(/\D/g, '').slice(-9)}?text=${encodeURIComponent(full)}`;
}

/**
 * Orders arrive from the server on every render; status changes PATCH the API
 * and then `router.refresh()` so the fresh row flows back down as a prop. No
 * local copy of the list to drift out of sync.
 */
export function OrdersList({ orders, settings }: { orders: Order[]; settings: StoreSettings }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [printing, setPrinting] = useState<Order | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^kch-?/, 'kch-');
    const digits = q.replace(/\D/g, '');
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (digits.length > 0 && o.customerPhone.replace(/\D/g, '').includes(digits)) ||
        o.customerName.toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const handleStatus = async (orderNumber: string, status: OrderStatus) => {
    const current = orders.find((order) => order.orderNumber === orderNumber);
    let shipment: { courierName?: string; trackingNumber?: string } | undefined;
    if (status === 'dispatched') {
      const courierName = window.prompt(
        'Courier ka naam likhein (misal: TCS, Leopards, Trax, PostEx):',
        current?.courierName ?? ''
      )?.trim();
      if (!courierName) return;
      const trackingNumber = window.prompt(
        'Courier tracking ID / consignment number likhein:',
        current?.trackingNumber ?? ''
      )?.trim();
      if (!trackingNumber) return;
      shipment = { courierName, trackingNumber };
    }

    setSaving(orderNumber);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...shipment }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify(data.error ?? 'Status could not be saved.', 'error');
        return;
      }
      notify(`${orderNumber} → ${status}`, 'success');
      router.refresh();
    } catch {
      notify('Network problem — status was not saved.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handlePrint = (order: Order) => {
    setPrinting(order);
    // Let React paint the printable slip before the print dialog opens.
    window.setTimeout(() => {
      window.print();
      setPrinting(null);
    }, 50);
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`${order.orderNumber} permanently delete karna hai? Ye action undo nahi hoga.`)) return;
    setDeleting(order.orderNumber);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify(data.error ?? 'Order delete nahi ho saka.', 'error');
        return;
      }
      notify(`${order.orderNumber} delete ho gaya.`, 'success');
      router.refresh();
    } catch {
      notify('Network problem — order delete nahi ho saka.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <h1 className="admin-heading">Orders</h1>
      <p className="admin-subheading">
        Search, confirm, dispatch and message customers — all from your phone.
      </p>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <input
            className="admin-search"
            type="search"
            placeholder="Search order no. or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search orders"
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', ...ORDER_STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className="admin-btn admin-btn--ghost admin-btn--sm"
                style={
                  statusFilter === s
                    ? { backgroundColor: '#030302', color: '#ffffff' }
                    : undefined
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-empty">
            {orders.length === 0
              ? 'No orders yet. Place a test order from the storefront to see it here.'
              : 'No orders match this search.'}
          </p>
        ) : (
          filtered.map((order) => (
            <div className="admin-order" key={order.orderNumber}>
              <div className="admin-order-top">
                <div>
                  <span className="admin-order-id">{order.orderNumber}</span>
                  <span className="admin-order-meta" style={{ marginLeft: 12 }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <span className="admin-badge" data-status={order.status}>
                  {order.status}
                </span>
              </div>

              <div className="admin-order-line admin-order-customer" style={{ marginBottom: 8 }}>
                <span>
                  <strong>{order.customerName}</strong>
                </span>
                <span>{order.customerPhone}</span>
                <span>{order.city}</span>
                <span className="admin-order-total">{formatMoney(order.totalAmount)}</span>
                <span>
                  {order.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                </span>
              </div>

              {order.courierName && order.trackingNumber && (
                <p className="admin-order-shipment" style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
                  <strong style={{ color: '#10231C' }}>Courier:</strong> {order.courierName}
                  {' · '}
                  <strong style={{ color: '#10231C' }}>Tracking:</strong> {order.trackingNumber}
                  {getCourierTrackingUrl(order.courierName, order.trackingNumber) && (
                    <a
                      href={getCourierTrackingUrl(order.courierName, order.trackingNumber) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: 8, color: '#7A5F0E', textDecoration: 'underline' }}
                    >
                      Live tracking
                    </a>
                  )}
                </p>
              )}

              <p className="admin-order-address"
                style={{
                  fontSize: 12,
                  color: '#6b7280',
                  margin: '0 0 12px',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: '#10231C', fontWeight: 600 }}>Delivery address: </strong>
                {order.deliveryAddress}
                {order.specialInstructions && (
                  <>
                    <br />
                    <strong style={{ color: '#10231C', fontWeight: 600 }}>Notes: </strong>
                    {order.specialInstructions}
                  </>
                )}
              </p>

              <div className="admin-order-items" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {order.items.map((item, i) => (
                  <div className="admin-order-item"
                    key={`${item.slug}-${i}`}
                    style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 56,
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: '1px solid var(--color-border, #e5e5e5)',
                        background: '#f4f4f5',
                      }}
                    >
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#10231C', margin: 0 }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>
                        Color:{' '}
                        <strong style={{ color: '#10231C' }}>{item.color || '—'}</strong>
                        {' · '}Qty {item.quantity} · {formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-order-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <select
                  className="admin-status-select"
                  value={order.status}
                  disabled={saving === order.orderNumber}
                  onChange={(e) => handleStatus(order.orderNumber, e.target.value as OrderStatus)}
                  aria-label={`Status for ${order.orderNumber}`}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <a
                  href={whatsappUpdateUrl(order, order.status, settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn--whatsapp admin-btn--sm"
                >
                  Send WhatsApp Update
                </a>

                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => handlePrint(order)}
                >
                  Print Slip
                </button>

                <a
                  href={`tel:+${order.customerPhone.replace(/\D/g, '')}`}
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                >
                  Call Customer
                </a>

                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  disabled={deleting === order.orderNumber || saving === order.orderNumber}
                  onClick={() => handleDelete(order)}
                >
                  {deleting === order.orderNumber ? 'Deleting…' : 'Delete Order'}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Printable packing slip */}
      {printing && (
        <div className="print-slip">
          <h2>{settings.storeName}</h2>
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
          <hr />
          <p>
            <strong>Order:</strong> {printing.orderNumber}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(printing.createdAt)}
          </p>
          <p>
            <strong>Status:</strong> {printing.status}
          </p>
          <hr />
          <p>
            <strong>To:</strong> {printing.customerName}
          </p>
          <p>{printing.deliveryAddress}</p>
          <p>
            {printing.city} · {printing.customerPhone}
          </p>
          <hr />
          <table>
            <tbody>
              {printing.items.map((item) => (
                <tr key={item.slug}>
                  <td>{item.title}</td>
                  <td>{item.color}</td>
                  <td>×{item.quantity}</td>
                  <td>{formatMoney(item.price * item.quantity)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3}>Subtotal</td>
                <td>{formatMoney(printing.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3}>Delivery</td>
                <td>{printing.deliveryCharges === 0 ? 'FREE' : formatMoney(printing.deliveryCharges)}</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <strong>Total (COD)</strong>
                </td>
                <td>
                  <strong>{formatMoney(printing.totalAmount)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
