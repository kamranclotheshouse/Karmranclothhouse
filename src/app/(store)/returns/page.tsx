import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/settings';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { address } = await getStoreSettings();
  return {
    title: 'Exchange & Return Policy | Kamran Cloth House — Saddar, Peshawar',
    description: `Exchange and return rules for Kamran Cloth House fabric orders. ${address}`,
  };
}

const rules = [
  {
    title: 'Inspect Before Paying',
    body: 'Because every order is Cash on Delivery, you can open the parcel in front of the courier rider. If anything is wrong, simply refuse the parcel — you pay zero.',
  },
  {
    title: '7-Day Full Exchange',
    body: 'Wrong colour, changed your mind, or a defect you spotted at home? Bring or courier it back within 7 days of delivery for a hassle-free exchange.',
  },
  {
    title: 'Fabric Must Be Uncut',
    body: 'The suit piece must remain cut-free, unwashed, and unstitched with original tags and packaging intact.',
  },
  {
    title: 'Lifetime Rang & Burr Guarantee',
    body: 'Colour fastness and pilling are covered for the lifetime of the fabric. If a piece fades or pills through normal washing, we replace it.',
  },
  {
    title: 'Courier Coverage',
    body: 'We cover return courier charges for our mistakes (wrong item or defect). Customer-preference exchanges are shipped back at standard courier cost.',
  },
];

export default async function ReturnsPage() {
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
              Shop With Complete Confidence
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            Exchange &amp; Returns
          </h1>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Unstitched luxury fabric is a prized purchase. Here are our exact terms that protect your investment.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {rules.map((rule) => (
              <div
                key={rule.title}
                className="bg-white p-7 border border-line shadow-sm hover:border-[#C9A227] transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9A227' }} />
                  <h2
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-base font-bold text-ink"
                  >
                    {rule.title}
                  </h2>
                </div>
                <p className="text-xs leading-relaxed text-zinc-600">{rule.body}</p>
              </div>
            ))}
          </div>

          <div
            className="p-6 mb-8 border border-line"
            style={{ backgroundColor: 'var(--color-cream)' }}
          >
            <p className="text-xs text-zinc-700 leading-relaxed">
              <strong>Need an exchange?</strong> Send your order number (e.g. KCH-1042) and a photo of the parcel to our WhatsApp team. Our Saddar boutique responds within 30 minutes during shop hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                'السلام علیکم، مجھے کامران کلوتھ ہاؤس سے exchange / return کے بارے میں مدد چاہیے۔'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E7C6E' }}
            >
              Start Exchange on WhatsApp
            </a>
            <Link
              href="/delivery"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-ink border border-line hover:border-brand hover:text-brand transition-colors text-center"
            >
              Read Delivery Policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
