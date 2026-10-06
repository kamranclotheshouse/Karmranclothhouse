'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cartSubtotal } from '@/lib/cart';
import { getDeliveryFee, type StoreSettings } from '@/lib/settings';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  items: { slug: string; name: string; brand: string; price: number; image: string; color: string; quantity: number }[];
  setQty: (slug: string, color: string, quantity: number) => void;
  remove: (slug: string, color: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  settings,
  items,
  setQty,
  remove,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = cartSubtotal(items);
  const deliveryFee = getDeliveryFee(settings, subtotal);
  const remaining = settings.freeDeliveryThreshold - subtotal;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-[440px] bg-white flex flex-col shadow-2xl transition-transform duration-400 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line flex-shrink-0">
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-lg tracking-widest text-ink"
            >
              Your Basket
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {items.length === 0
                ? 'Nothing here yet'
                : `${items.length} item${items.length === 1 ? '' : 's'} · Cash on Delivery`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full transition-colors"
            aria-label="Close basket"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-cream)' }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: 'var(--color-fg-muted)' }}
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-base tracking-widest">
                Your basket is empty
              </p>
              <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                Browse our fabrics and add what you like — you only pay when the parcel arrives.
              </p>
              <Link
                href="/categories"
                onClick={onClose}
                className="mt-2 px-8 py-3 text-xs tracking-[0.25em] uppercase bg-brand text-white hover:bg-brand-soft transition-colors font-semibold"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={`${item.slug}::${item.color}`} className="flex gap-4 p-5">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={onClose}
                    className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-cream block"
                  >
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] tracking-widest uppercase text-muted mb-0.5">
                          {item.brand}
                        </p>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={onClose}
                          style={{ fontFamily: "'Playfair Display', serif" }}
                          className="text-sm tracking-wide text-ink hover:opacity-60 transition-opacity block truncate"
                        >
                          {item.name}
                        </Link>
                        {item.color && (
                          <p className="text-[11px] text-muted mt-1">
                            Color: <span className="text-ink font-medium">{item.color}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(item.slug, item.color)}
                        className="text-muted hover:text-ink transition-colors p-1"
                        aria-label={`Remove ${item.name}`}
                        title="Remove"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-line w-fit">
                        <button
                          onClick={() => setQty(item.slug, item.color, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-sm font-bold bg-cream hover:bg-brand hover:text-white transition-colors disabled:opacity-40"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold border-x border-line">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQty(item.slug, item.color, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-sm font-bold bg-cream hover:bg-brand hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-ink whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-line p-5 space-y-3 flex-shrink-0 bg-white">
            {remaining > 0 ? (
              <div>
                <p className="text-[11px] text-muted mb-1.5">
                  Add <span className="font-semibold text-ink">Rs. {remaining.toLocaleString()}</span> more for{' '}
                  <span className="font-semibold" style={{ color: 'var(--color-gold-text)' }}>
                    free delivery
                  </span>
                </p>
                <div className="h-1.5 bg-line overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (subtotal / settings.freeDeliveryThreshold) * 100)}%`,
                      backgroundColor: 'var(--color-gold-text)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <p
                className="text-[11px] text-center font-semibold"
                style={{ color: 'var(--color-gold-text)' }}
              >
                ✓ You have unlocked FREE delivery
              </p>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-ink">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span className="font-semibold text-ink">
                {deliveryFee === 0 ? (
                  <span style={{ color: 'var(--color-gold-text)' }}>FREE</span>
                ) : (
                  `Rs. ${deliveryFee.toLocaleString()}`
                )}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-4 text-center text-xs tracking-[0.3em] uppercase bg-brand text-white hover:bg-brand-soft transition-colors font-semibold shadow-md"
            >
              Checkout — COD
            </button>
          </div>
        )}
      </div>
    </>
  );
}