import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/settings';

export async function generateMetadata(): Promise<Metadata> {
  const { address } = await getStoreSettings();
  return {
    title: 'Delivery Policy | Kamran Cloth House — Saddar, Peshawar',
    description: `Delivery timelines, charges and courier partners for Kamran Cloth House orders across Pakistan. ${address}`,
  };
}

const steps = [
  {
    title: 'Order Confirmed',
    body: 'We review your order and confirm stock, colour and any special request on WhatsApp or phone during store hours.',
  },
  {
    title: 'Packed & Handed to Courier',
    body: 'After confirmation, your fabric is folded, packed and handed to a registered courier. The courier may be TCS, Leopards, PostEx or another available partner.',
  },
  {
    title: 'Out for Delivery',
    body: 'We share the courier name and tracking number after dispatch. Transit is usually 2–5 working days, depending on your city and route.',
  },
  {
    title: 'Inspect Before Paying',
    body: 'Pay the confirmed COD amount when the parcel arrives. If there is a visible issue, contact us immediately with your order number and photos before using the fabric.',
  },
];

export default async function DeliveryPage() {
  const settings = await getStoreSettings();

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
              Nationwide Cash on Delivery
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            Delivery Policy
          </h1>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Straightforward shipping across Pakistan — no advance payment required.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Charges Banner */}
          <div
            className="p-8 mb-12 border shadow-sm"
            style={{ backgroundColor: 'var(--color-cream)', borderColor: 'var(--color-border)' }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl text-ink font-semibold mb-4">
              Shipping Rates &amp; Free Delivery
            </h2>
            <div className="space-y-2.5 text-sm text-zinc-700">
              <p>
                <span className="font-bold text-ink" style={{ color: '#0E3B2C' }}>Free Delivery</span> on all orders of{' '}
                <span className="font-bold text-ink">Rs. {settings.freeDeliveryThreshold.toLocaleString()}</span> and above.
              </p>
              <p>
                Flat rate of <span className="font-bold text-ink">Rs. {settings.deliveryCharge}</span> for orders below the threshold.
              </p>
              <p className="text-xs text-zinc-500 pt-2 border-t border-line">
                All parcels are dispatched from Saddar, Peshawar via registered couriers with tracking.
              </p>
            </div>
          </div>

          {/* Timeline Steps */}
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl text-ink font-semibold mb-8">
            How Your Delivery Works
          </h2>
          <ol className="space-y-6 mb-12">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-5 items-start">
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                  style={{ backgroundColor: '#0E3B2C', color: '#FFFFFF' }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-base font-semibold mb-1 text-ink"
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="pt-8 border-t border-line flex flex-col sm:flex-row gap-4">
            <Link
              href="/track"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E3B2C' }}
            >
              Track My Order
            </Link>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E7C6E' }}
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
