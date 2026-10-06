'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCourierTrackingUrl, type Order, type TrackedOrder } from '@/lib/orders';

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

const STATUS_FLOW: Order['status'][] = ['pending', 'confirmed', 'dispatched', 'delivered'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Karachi',
  });
}

export default function TrackPage() {
  const [query, setQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    const phoneNumber = phone.replace(/[-\s]/g, '');
    if (!/^03\d{9}$/.test(phoneNumber)) {
      setError('Apna order wala valid mobile number (03XXXXXXXXX) likhein.');
      setSearched(true);
      return;
    }
    setBusy(true);
    setOrder(null);
    setSearched(false);
    setError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(value)}?phone=${encodeURIComponent(phoneNumber)}`, {
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json()) as { ok: boolean; error?: string; order?: TrackedOrder };
      if (res.ok && data.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(
          res.status === 404
            ? 'No matching order found. Order number aur mobile number dobara check karein.'
            : data.error ?? 'Could not look up your order. Please try again.'
        );
      }
    } catch {
      setError('Network problem — could not look up your order. Please try again.');
    } finally {
      setBusy(false);
      setSearched(true);
    }
  };

  const currentIndex = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <>
      {/* ── Page Header ── */}
      <section
        style={{
          backgroundColor: '#0E3B2C',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
        className="py-16 md:py-20 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
            <p className="text-[10px] tracking-[0.45em] uppercase font-semibold" style={{ color: '#C9A227' }}>
              Order Status
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            Check Your Order
          </h1>

          <p className="max-w-md mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Enter your order number and the mobile number used at checkout (e.g.{' '}
            <span className="font-semibold text-white font-mono" style={{ color: '#C9A227' }}>KCH-1042</span>) to see your order, its items and current status. Our team updates the status as your order is confirmed, dispatched and delivered.
          </p>
        </div>
      </section>

      {/* ── Main Lookup Section ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. KCH-1042"
              className="flex-1 px-4 py-4 bg-white text-sm text-ink font-mono border border-line focus:outline-none focus:border-[#C9A227] transition-colors uppercase"
              aria-label="Order number"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile: 03001234567"
              className="flex-1 px-4 py-4 bg-white text-sm text-ink font-mono border border-line focus:outline-none focus:border-[#C9A227] transition-colors"
              aria-label="Mobile number used for the order"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-9 py-4 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0E3B2C' }}
            >
              {busy ? 'Searching…' : 'Track Order'}
            </button>
          </form>

          {searched && !order && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-xs mb-8">
              {error}
            </div>
          )}

          {order && (
            <div className="border border-line shadow-sm">
              {/* Header */}
              <div
                className="px-6 py-5 border-b border-line flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-cream)' }}
              >
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                    Order Reference
                  </p>
                  <p className="text-lg font-bold font-mono text-ink">{order.orderNumber}</p>
                </div>
                <span
                  className="text-[10px] tracking-widest uppercase px-3 py-1.5 font-bold"
                  style={{ backgroundColor: '#C9A227', color: '#10231C' }}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Status timeline */}
              {order.status !== 'cancelled' && order.status !== 'returned' && (
                <div className="px-6 py-8 border-b border-line bg-white">
                  <div className="flex items-center">
                    {STATUS_FLOW.map((status, i) => (
                      <div key={status} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{
                              backgroundColor: i <= currentIndex ? '#0E3B2C' : 'var(--color-border)',
                              color: 'white',
                            }}
                          >
                            {i <= currentIndex ? '✓' : ''}
                          </span>
                          <span
                            className="text-[10px] tracking-wider uppercase whitespace-nowrap font-medium"
                            style={{
                              color: i <= currentIndex ? '#0E3B2C' : 'var(--color-fg-muted)',
                            }}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div
                            className="flex-1 h-[2px] mx-2 mb-5"
                            style={{
                              backgroundColor: i < currentIndex ? '#0E3B2C' : 'var(--color-border)',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="px-6 py-5 border-b border-line space-y-4">
                {order.items.map((item) => (
                  <div key={item.slug} className="flex gap-4 items-start">
                    <div className="relative w-16 h-20 bg-zinc-100 overflow-hidden flex-shrink-0 border border-line">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-widest uppercase font-semibold mb-0.5" style={{ color: '#7A5F0E' }}>
                        {item.brand}
                      </p>
                      <p
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-sm text-ink leading-snug font-medium"
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {item.color} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-ink">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {order.courierName && order.trackingNumber && (
                <div className="px-6 py-5 border-b border-line bg-emerald-50/40">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-ink mb-2">Shipment Tracking</p>
                  <p className="text-xs text-zinc-600">
                    Courier: <strong className="text-ink">{order.courierName}</strong>
                    {' · '}Tracking ID: <strong className="text-ink">{order.trackingNumber}</strong>
                  </p>
                  {getCourierTrackingUrl(order.courierName, order.trackingNumber) && (
                    <a
                      href={getCourierTrackingUrl(order.courierName, order.trackingNumber) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-3 px-4 py-2 bg-brand text-white text-[10px] tracking-widest uppercase font-bold"
                    >
                      Live Tracking
                    </a>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="px-6 py-5 space-y-2.5 bg-zinc-50/50">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Delivering to</span>
                  <span className="text-ink font-semibold text-right max-w-[60%]">
                    {order.city}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Placed on</span>
                  <span className="text-ink font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Payment</span>
                  <span className="text-ink font-medium">{order.paymentMethod}</span>
                </div>
                <div
                  className="flex justify-between text-sm font-bold text-ink pt-3 mt-1 border-t border-line"
                >
                  <span>Total Amount</span>
                  <span style={{ color: '#0E3B2C' }}>Rs. {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-line flex flex-col sm:flex-row gap-4">
            <Link
              href="/delivery"
              className="flex-1 py-3 text-xs tracking-[0.2em] uppercase font-bold text-ink border border-line hover:border-brand hover:text-brand transition-colors text-center"
            >
              Delivery Timeline
            </Link>
            <Link
              href="/returns"
              className="flex-1 py-3 text-xs tracking-[0.2em] uppercase font-bold text-ink border border-line hover:border-brand hover:text-brand transition-colors text-center"
            >
              Exchange Policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
