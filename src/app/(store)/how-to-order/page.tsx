import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/settings';

export async function generateMetadata(): Promise<Metadata> {
  const { address } = await getStoreSettings();
  return {
    title: 'How to Order | Kamran Cloth House — Saddar, Peshawar',
    description: `Order unstitched fabrics from Kamran Cloth House on WhatsApp — cash on delivery across Pakistan. ${address}`,
  };
}

const steps = [
  {
    title: 'Browse & Pick Your Fabric',
    body: 'Browse products by category or brand, choose a colour and quantity, then tap Order Now. You can also save the product link or screenshot for a WhatsApp order.',
  },
  {
    title: 'Enter Your Delivery Details',
    body: 'Add your name, WhatsApp number, complete address and city in the checkout drawer. Please double-check your phone number so the courier can reach you.',
  },
  {
    title: 'Stock & Colour Confirmed',
    body: 'Our team reviews the order and contacts you on WhatsApp or phone to confirm stock, colour and any special request before dispatch.',
  },
  {
    title: 'Cash on Delivery Dispatch',
    body: 'After confirmation, your fabric is packed and handed to a registered courier. We share the courier name and tracking number when the order is dispatched. No advance payment is required.',
  },
  {
    title: 'Receive & Pay Cash',
    body: 'Pay the confirmed Cash on Delivery amount to the courier. If there is a delivery issue, contact us with your order number before cutting, washing or stitching the fabric.',
  },
];

export default async function HowToOrderPage() {
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
              Order on WhatsApp · Pay on Delivery
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            How to Order
          </h1>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Five simple steps from browsing to delivery — no advance payment, no account required.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* No-advance banner */}
          <div
            className="p-8 mb-12 border shadow-sm text-center"
            style={{ backgroundColor: 'var(--color-cream)', borderColor: 'var(--color-border)' }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl text-ink font-semibold mb-3">
              Nationwide Cash on Delivery
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed max-w-2xl mx-auto">
              Free delivery on orders of{' '}
              <span className="font-bold text-ink">Rs. {settings.freeDeliveryThreshold.toLocaleString()}</span> and
              above. Flat <span className="font-bold text-ink">Rs. {settings.deliveryCharge}</span> below the
              threshold. You pay only when the parcel is in your hands.
            </p>
          </div>

          {/* Steps */}
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
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E7C6E' }}
            >
              Order on WhatsApp
            </a>
            <Link
              href="/faq"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E3B2C' }}
            >
              Read FAQs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
