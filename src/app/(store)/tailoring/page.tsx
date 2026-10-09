import { Metadata } from 'next';
import { getStoreSettings } from '@/lib/db/settings';

export const metadata: Metadata = {
  title: 'Master Tailoring Service | Kamran Cloth House — Saddar, Peshawar',
  description:
    'Experience bespoke men’s tailoring at Kamran Cloth House, Shafi Market, Saddar Peshawar. Kurta shalwar, waistcoats, prince coats, and sherwanis stitched by master craftsmen.',
};

const PACKAGES = [
  {
    title: 'Classic Kurta Shalwar',
    tag: 'Everyday & Formal',
    price: 'Price on inquiry',
    description: 'Perfect for regular wash’n wear, soft cottons, and daily Karandi.',
    features: [
      'Single/Double needle stitching',
      'Soft German collar fusing (no bubbling)',
      'Side and pen pocket placement',
      'Comfortable Shalwar cut with broad hem',
    ],
  },
  {
    title: 'Executive Suit Stitching',
    tag: 'Signature Fit',
    price: 'Price on inquiry',
    description: 'Ideal for Giza Egyptian cottons, festive events, and office wear.',
    features: [
      'Choice of Sherwani collar, English collar, or round band',
      'Concealed placket with horn/brass button accents',
      'Reinforced seams & contrast inner piping',
      'Tailored cuff styles with French slit options',
    ],
    highlight: true,
  },
  {
    title: 'Bespoke Waistcoat',
    tag: 'Traditional Elegance',
    price: 'Price on inquiry',
    description: 'Hand-crafted over Jamawar, Banarasi, tropical suiting, or velvet.',
    features: [
      'Full canvas chest piece for structural drape',
      'Double welt pockets & chest pocket for pocket square',
      'Satin/Silk blended back lining with cinch belt',
      'Hand-attached antique metal or covered buttons',
    ],
  },
  {
    title: 'Royal Groom / Prince Coat',
    tag: 'Bridal & Formal',
    price: 'Price on inquiry',
    description: 'Tailored specifically for grooms, valima functions, and royal occasions.',
    features: [
      'Full bespoke pattern draft tailored to your silhouette',
      'Italian horsehair interlining for lasting structure',
      'Intricate collar hand-finishing & embroidery prep',
      'Priority fitting & trial session included',
    ],
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Fabric Selection',
    description: 'Select your preferred unstitched fabric from our 30+ brands, or bring your own cut length into our Saddar boutique.',
  },
  {
    step: '02',
    title: 'Precision Measurements',
    description: 'Our master tailor takes 14 precise measurements, tailoring the collar width, shoulder slope, and chest drape to your preference.',
  },
  {
    step: '03',
    title: 'Master Craftsmanship',
    description: 'Crafted with premium German threads and German canvas fusing that guarantees zero bubbling wash after wash.',
  },
  {
    step: '04',
    title: 'Quality Check & Delivery',
    description: 'Every garment undergoes a 5-point inspection before pressing. Delivery available in Peshawar or courier nationwide.',
  },
];

export default async function TailoringPage() {
  const settings = await getStoreSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    'السلام علیکم، میں کامران کلوتھ ہاؤس سے ماسٹر ٹیلرنگ سروس کے بارے میں معلومات اور بکنگ چاہتا ہوں۔'
  )}`;

  return (
    <>
      {/* ── Hero Header ── */}
      <section
        style={{
          backgroundColor: '#0E3B2C',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
        className="py-16 md:py-24 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
            <p className="text-[10px] tracking-[0.45em] uppercase font-semibold" style={{ color: '#C9A227' }}>
              In-House Bespoke Workshop · Saddar, Peshawar
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight drop-shadow-md"
          >
            Master Tailoring Service
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base leading-relaxed font-light mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Unstitched luxury fabric deserves master craftsmanship. Our resident tailors in Shafi Market have been stitching perfection since 1990.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-shimmer inline-flex items-center gap-3 px-9 py-4 text-xs tracking-[0.25em] uppercase font-bold transition-all shadow-xl hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(201,162,39,0.35)]"
            style={{ backgroundColor: '#C9A227', color: '#10231C' }}
          >
            <span>Book Tailoring Consultation</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── 4-Step Process ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#7A5F0E' }}>
              The Bespoke Experience
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl md:text-4xl text-ink">
              How Our Stitching Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="p-6 relative transition-all duration-350 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C9A227]"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  className="text-3xl font-bold mb-4 transition-transform duration-300 group-hover:scale-105"
                  style={{ color: '#C9A227', fontFamily: "'Playfair Display', serif" }}
                >
                  {step.step}
                </div>
                <h3
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-lg font-semibold text-ink mb-2"
                >
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Packages ── */}
      <section style={{ backgroundColor: 'var(--color-cream)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#7A5F0E' }}>
              Custom Quotes
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl md:text-4xl text-ink">
              Stitching Packages &amp; Quotes
            </h2>
            <p className="text-xs text-zinc-600 mt-2">Fabric can be purchased from our store or brought by customer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.title}
                className="bg-white p-7 flex flex-col justify-between transition-all duration-350 hover:-translate-y-2 hover:shadow-2xl relative"
                style={{
                  border: pkg.highlight ? '2px solid #C9A227' : '1px solid var(--color-border)',
                  boxShadow: pkg.highlight ? '0 8px 30px rgba(14,59,44,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {pkg.highlight && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 text-ink shadow-md"
                    style={{ backgroundColor: '#C9A227' }}
                  >
                    Most Popular
                  </span>
                )}

                <div>
                  <p className="text-[10px] tracking-wider uppercase font-semibold mb-1" style={{ color: '#7A5F0E' }}>
                    {pkg.tag}
                  </p>
                  <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-ink mb-3">
                    {pkg.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-lg font-bold" style={{ color: '#0E3B2C', fontFamily: "'Playfair Display', serif" }}>
                      {pkg.price}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
                    {pkg.description}
                  </p>

                  <ul className="space-y-2.5 mb-8 text-xs text-zinc-700">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <span className="text-xs font-bold mt-0.5" style={{ color: '#C9A227' }}>✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shimmer block w-full py-3.5 text-center text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    backgroundColor: pkg.highlight ? '#0E3B2C' : 'transparent',
                    color: pkg.highlight ? '#FFFFFF' : '#0E3B2C',
                    border: '1px solid #0E3B2C',
                  }}
                >
                  Book on WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl text-ink">
              Tailoring FAQs
            </h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-line">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-2">How long does stitching take?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Standard turnaround is 4 to 6 business days. Express 48-hour stitching is available upon request for an urgent fee.
              </p>
            </div>
            <div className="p-6 border border-line">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-2">Can I send measurements online?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Yes! You can share your measurements via WhatsApp, or courier an existing well-fitting suit to our Saddar store as a sample. We will replicate the fit with 100% accuracy.
              </p>
            </div>
            <div className="p-6 border border-line">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-2">What is your fitting guarantee?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                If the fit does not match your submitted specifications, our master tailors will alter or adjust it completely free of charge.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
