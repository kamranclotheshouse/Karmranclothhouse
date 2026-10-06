import Link from 'next/link';
import { Metadata } from 'next';
import { getBrands } from '@/lib/db/storefront';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Brands | Kamran Cloth House — Shafi Market, Saddar Peshawar',
  description:
    'Explore 30+ premium fabric brands at Kamran Cloth House, Saddar Peshawar. Grace, Pasha, Gul Ahmed, Din Fabrics and more — Cash on Delivery across Pakistan.',
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      {/* ── Page Header ── */}
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
              30+ Certified Fabric Mills &amp; Labels
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight drop-shadow-md"
          >
            Our Trusted Brands
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Kamran Cloth House is an authorized stockist for Pakistan&apos;s most prestigious textile mills — guaranteed 100% original, unstitched suitings and seasonal collections.
          </p>
        </div>
      </section>

      {/* ── Brands Grid ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group bg-white flex flex-col items-center justify-center py-10 px-5 text-center transition-all duration-350 hover:-translate-y-2 hover:shadow-xl hover:border-[#C9A227]"
                style={{
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Brand Monogram Badge */}
                <div
                  className="w-14 h-14 rounded-full mb-4 flex items-center justify-center text-lg font-bold transition-all duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(201,162,39,0.12)',
                    border: '1px solid rgba(201,162,39,0.35)',
                    color: '#C9A227',
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {brand.name.charAt(0)}
                </div>

                <h2
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-base font-semibold mb-1 text-ink group-hover:text-brand transition-colors"
                >
                  {brand.name}
                </h2>

                <p className="text-[10px] tracking-wide mb-4 line-clamp-1" style={{ color: '#7A5F0E' }}>
                  {brand.tag}
                </p>

                <span
                  className="text-[10px] tracking-[0.25em] uppercase font-bold transition-all duration-300 flex items-center gap-1.5"
                  style={{ color: '#0E3B2C' }}
                >
                  <span>View Fabric</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
