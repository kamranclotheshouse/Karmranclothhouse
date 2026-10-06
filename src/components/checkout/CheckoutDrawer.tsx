'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { PAKISTAN_CITIES, type NewOrderInput, type Order } from '@/lib/orders';
import { cartSubtotal, type CartItem } from '@/lib/cart';
import { getDeliveryFee, type StoreSettings } from '@/lib/settings';
import { trackAddToCart, trackPurchase } from '@/lib/analytics';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  /** One line for "Buy now", the whole basket for checkout. */
  items: CartItem[];
  /** Called once the order is accepted — the basket clears itself here. */
  onPlaced?: () => void;
}

type OrderStep = 'form' | 'success';

export default function CheckoutDrawer({
  isOpen,
  onClose,
  settings,
  items,
  onPlaced,
}: CheckoutDrawerProps) {
  const [step, setStep] = useState<OrderStep>('form');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpen.current && items.length > 0) {
      trackAddToCart(
        items.map((i) => ({ slug: i.slug, name: i.name, price: i.price, quantity: i.quantity }))
      );
    }
    wasOpen.current = isOpen;
  }, [isOpen, items]);

  const subtotal = cartSubtotal(items);
  const deliveryFee = getDeliveryFee(settings, subtotal);
  const total = subtotal + deliveryFee;

  const filteredCities = PAKISTAN_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 6);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!/^03\d{9}$/.test(form.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Enter valid Pakistani number (03XXXXXXXXX)';
    }
    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = 'Enter complete address (min 10 characters)';
    }
    if (!form.city) newErrors.city = 'Select your city';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitError('');
    setLoading(true);

    const payload: NewOrderInput = {
      customerName: form.name.trim(),
      customerPhone: form.phone.replace(/[-\s]/g, ''),
      customerAltPhone: form.altPhone.replace(/[-\s]/g, ''),
      deliveryAddress: form.address.trim(),
      city: form.city,
      specialInstructions: form.specialInstructions.trim(),
      subtotal,
      deliveryCharges: deliveryFee,
      items: items.map((item) => ({
        slug: item.slug,
        title: item.name,
        brand: item.brand,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        fields?: Record<string, string>;
        order?: Order;
      };

      if (!res.ok || !data.ok || !data.order) {
        const SERVER_TO_FORM: Record<string, string> = {
          customerName: 'name',
          customerPhone: 'phone',
          customerAltPhone: 'altPhone',
          deliveryAddress: 'address',
          city: 'city',
          specialInstructions: 'specialInstructions',
        };
        const mapped: Record<string, string> = {};
        let topError = '';
        for (const [key, message] of Object.entries(data.fields ?? {})) {
          const target = SERVER_TO_FORM[key];
          if (target) mapped[target] = message;
          else topError = topError || message;
        }
        setErrors(mapped);
        setSubmitError(topError || data.error || 'Order could not be placed. Please try again.');
        return;
      }

      setOrderId(data.order.orderNumber);
      setStep('success');
      trackPurchase({
        orderNumber: data.order.orderNumber,
        value: total,
        items: items.map((i) => ({ slug: i.slug, quantity: i.quantity, price: i.price })),
      });
      onPlaced?.();
    } catch {
      setSubmitError(
        'Network problem — your order was NOT placed. Please check your connection and try again, or WhatsApp us.'
      );
    } finally {
      setLoading(false);
    }
  };

  const orderLines = items
    .map(
      (item) =>
        `• ${item.name} (${item.brand})${item.color ? ` — ${item.color}` : ''} × ${item.quantity} = Rs. ${(
          item.price * item.quantity
        ).toLocaleString()}`
    )
    .join('\n');

  const whatsappConfirmMsg = encodeURIComponent(
    `السلام علیکم ${settings.storeName}،\n\n` +
      `میرا COD Order Confirm ہو گیا:\n\n` +
      `Order ID: ${orderId}\n` +
      `Items:\n${orderLines}\n` +
      `Total: Rs. ${total.toLocaleString()}${
        deliveryFee === 0 ? ' (Free Delivery)' : ` (including Rs. ${deliveryFee} delivery)`
      }\n\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Address: ${form.address}, ${form.city}`
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-[480px] bg-white flex flex-col shadow-2xl transition-transform duration-400 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line flex-shrink-0">
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-lg tracking-widest text-ink"
            >
              {step === 'success' ? 'Order Placed!' : 'Cash on Delivery'}
            </h2>
            {step === 'form' && (
              <p className="text-xs text-muted mt-0.5">
                Pay when your parcel arrives — no advance payment
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full transition-colors"
            aria-label="Close checkout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 'form' ? (
            <div className="px-6 py-5 space-y-6">
              {/* Order Summary Card */}
              <div className="bg-cream border border-line divide-y divide-line">
                {items.map((item) => (
                  <div key={`${item.slug}::${item.color}`} className="flex gap-4 p-4">
                    <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-cream">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-widest uppercase text-muted mb-1">{item.brand}</p>
                      <p
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-sm tracking-wide text-ink font-medium leading-snug mb-2"
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-muted">
                        {item.color && (
                          <>
                            Color: <span className="text-ink font-semibold">{item.color}</span>
                            &nbsp;·&nbsp;
                          </>
                        )}
                        Qty: <span className="text-ink font-semibold">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="flex items-end justify-end">
                      <span className="text-sm font-semibold text-ink whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="bg-cream border border-line p-4 space-y-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>Subtotal ({items.reduce((n, item) => n + item.quantity, 0)} items)</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold" style={{ color: 'var(--color-gold-text)' }}>
                        FREE
                      </span>
                    ) : (
                      `Rs. ${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                {deliveryFee === 0 && (
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--color-fg-muted)' }}>
                    Orders of Rs. {settings.freeDeliveryThreshold.toLocaleString()}+ ship free across Pakistan.
                  </p>
                )}
                <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-line">
                  <span>Total (COD)</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <p
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-xs uppercase tracking-[0.2em] text-muted pb-1 border-b border-line"
                >
                  Delivery Information
                </p>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmad Khan"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-white text-sm text-ink border focus:outline-none focus:border-brand transition-colors ${
                      errors.name ? 'border-red-500' : 'border-line'
                    }`}
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-1.5">
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={`w-full px-4 py-3 bg-white text-sm text-ink font-mono border focus:outline-none focus:border-brand transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-line'
                      }`}
                    />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-1.5">
                      Alt. Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Optional"
                      value={form.altPhone}
                      onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-white text-sm text-ink font-mono border border-line focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="House # / Street / Mohalla / Area"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={`w-full px-4 py-3 bg-white text-sm text-ink border focus:outline-none focus:border-brand transition-colors resize-none ${
                      errors.address ? 'border-red-500' : 'border-line'
                    }`}
                  />
                  {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* City Autocomplete */}
                <div className="relative">
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="Type city name..."
                    value={form.city || citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setForm({ ...form, city: '' });
                      setShowCitySuggestions(true);
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    className={`w-full px-4 py-3 bg-white text-sm text-ink border focus:outline-none focus:border-brand transition-colors ${
                      errors.city ? 'border-red-500' : 'border-line'
                    }`}
                  />
                  {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}

                  {showCitySuggestions && citySearch.length > 0 && filteredCities.length > 0 && !form.city && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white border border-line shadow-lg max-h-40 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-cream transition-colors"
                          onClick={() => {
                            setForm({ ...form, city });
                            setCitySearch(city);
                            setShowCitySuggestions(false);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-1.5">
                    Special Instructions
                    <span className="font-normal text-muted ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder='e.g. "Need stitching", "Gift wrapping", "Call before delivery"'
                    value={form.specialInstructions}
                    onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-sm text-ink border border-line focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                {/* Order-level error (server rejected the whole submission) */}
                {submitError && (
                  <div role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700 leading-relaxed">
                    {submitError}
                  </div>
                )}

                {/* Trust Badges inside Drawer */}
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted pt-1">
                  <span>✓ No Advance Payment</span>
                  <span>·</span>
                  <span>✓ Easy Returns</span>
                  <span>·</span>
                  <span>✓ TCS / Leopard Courier</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand text-white uppercase text-xs tracking-[0.3em] font-semibold hover:bg-brand-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Confirm COD Order — Rs. {total.toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ── SUCCESS SCREEN ── */
            <div className="px-6 py-10 text-center">
              <div className="w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h3
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-2xl tracking-widest text-ink mb-2"
              >
                Order Placed!
              </h3>

              <p className="text-sm text-muted mb-1">Your Order ID:</p>
              <p className="text-2xl font-bold text-ink tracking-wider mb-8">{orderId}</p>

              {/* Order Summary */}
              <div className="bg-cream border border-line p-5 text-left mb-6 space-y-2.5">
                <div className="space-y-1.5 pb-2.5 border-b border-line">
                  <p className="text-muted uppercase tracking-wider text-xs">Items Ordered</p>
                  {items.map((item) => (
                    <div key={`${item.slug}::${item.color}`} className="flex justify-between gap-3 text-xs">
                      <span className="text-ink font-medium">
                        {item.name}
                        <span className="text-muted"> × {item.quantity}</span>
                      </span>
                      <span className="text-ink font-medium whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted uppercase tracking-wider">Order ID</span>
                  <span className="text-ink font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted uppercase tracking-wider">City</span>
                  <span className="text-ink font-medium">{form.city}</span>
                </div>
                <div className="flex justify-between text-xs pt-2.5 border-t border-line">
                  <span className="text-ink font-bold uppercase tracking-wider">Total COD Amount</span>
                  <span className="text-ink font-bold text-base">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-muted mb-6">
                Our team will confirm your order via WhatsApp / Call within{' '}
                <span className="text-ink font-semibold">30 minutes</span>. Delivery in{' '}
                <span className="text-ink font-semibold">2–5 business days</span>.
              </p>

              {/* WhatsApp Confirmation Button */}
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${whatsappConfirmMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--color-whatsapp)] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[var(--color-whatsapp-hover)] transition-colors shadow-md mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span>Send Order to WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 bg-white text-ink uppercase text-xs tracking-widest font-semibold border-2 border-ink hover:bg-ink hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}