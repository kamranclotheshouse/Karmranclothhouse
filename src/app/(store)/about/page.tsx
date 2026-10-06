import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Kamran Cloth House — Shafi Market, Saddar Peshawar',
  description:
    'Learn about Kamran Cloth House — Peshawar’s trusted destination for 100% authentic unstitched men’s fabrics, bridal groom wear, and luxury winter collections since 1990.',
};

export default function AboutPage() {
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
              Shafi Market · Saddar · Peshawar
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight drop-shadow-md"
          >
            Heritage of Elegance
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Serving gentlemen across Khyber Pakhtunkhwa and Pakistan with 100% original unstitched fabrics, master tailoring, and royal groom attire since 1990.
          </p>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Boutique Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 shadow-xl" style={{ border: '1px solid var(--color-border)' }}>
              <Image
                src="/images/hero.jpg"
                alt="Kamran Cloth House Saddar Peshawar Boutique"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.3)',
                }}
              />
            </div>

            {/* Story Content */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6" style={{ backgroundColor: '#C9A227' }} />
                <p className="text-[10px] tracking-[0.35em] uppercase font-semibold" style={{ color: '#7A5F0E' }}>
                  Our Heritage
                </p>
              </div>

              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl text-ink mb-6 leading-tight"
              >
                Decades of Trust in Peshawar
              </h2>

              <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(16, 35, 28, 0.75)' }}>
                <p>
                  Established in the historic fabric hub of Shafi Market, Saddar Peshawar, Kamran Cloth House has grown from a traditional local retailer into one of the region’s most respected purveyors of fine men’s unstitched fabrics.
                </p>
                <p>
                  Our philosophy is simple: zero compromise on fabric authenticity. Every suit piece in our store is sourced directly from certified textile mills — including Grace, Pasha Fabrics, Gul Ahmed, Din Fabrics, and Bannu Woolen Mills.
                </p>
                <p>
                  Whether preparing for a winter wedding with our signature royal Dulha Jamawars, selecting breathable Giza cotton for summer, or finding heavy Karandi and wool shawls, customers trust us for lifelong durability and genuine quality.
                </p>
              </div>

              {/* Stats Counters */}
              <div className="mt-8 pt-8 border-t border-line grid grid-cols-3 gap-4 text-center">
                <div className="p-4" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#0E3B2C', fontFamily: "'Playfair Display', serif" }}>35+</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#7A5F0E' }}>Years Legacy</p>
                </div>
                <div className="p-4" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#0E3B2C', fontFamily: "'Playfair Display', serif" }}>30+</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#7A5F0E' }}>Premium Brands</p>
                </div>
                <div className="p-4" style={{ backgroundColor: 'var(--color-cream)' }}>
                  <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#0E3B2C', fontFamily: "'Playfair Display', serif" }}>100%</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#7A5F0E' }}>Authentic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars of Quality ── */}
      <section style={{ backgroundColor: 'var(--color-cream)' }} className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#7A5F0E' }}>
              Our Promise
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl md:text-4xl text-ink">
              Why Peshawar Chooses Kamran
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-line shadow-sm hover:border-[#C9A227] transition-all">
              <div
                className="w-12 h-12 rounded-full mb-5 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#C9A227' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg text-ink font-semibold mb-2">
                Rang &amp; Burr Guarantee
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every fabric is tested for color fastness and surface resilience. We guarantee zero pilling (burr) and zero fading wash after wash.
              </p>
            </div>

            <div className="bg-white p-8 border border-line shadow-sm hover:border-[#C9A227] transition-all">
              <div
                className="w-12 h-12 rounded-full mb-5 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#C9A227' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg text-ink font-semibold mb-2">
                In-House Master Tailoring
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Our resident master tailors provide bespoke stitching tailored to your exact measurements, collar style, and cuff preferences.
              </p>
            </div>

            <div className="bg-white p-8 border border-line shadow-sm hover:border-[#C9A227] transition-all">
              <div
                className="w-12 h-12 rounded-full mb-5 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,162,39,0.12)', color: '#C9A227' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg text-ink font-semibold mb-2">
                Nationwide Cash on Delivery
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Order with confidence anywhere in Pakistan. Inspect your parcel and pay when it arrives at your doorstep via TCS / Leopard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Store Visit CTA ── */}
      <section style={{ backgroundColor: '#0E3B2C' }} className="py-20 text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <div className="h-px w-12 mx-auto mb-5" style={{ backgroundColor: '#C9A227' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl md:text-4xl text-white mb-4">
            Experience Our Fabrics In Person
          </h2>
          <p className="text-sm leading-relaxed mb-8 font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Visit our flagship boutique in Shafi Market, Saddar Peshawar. Feel the authentic textures and get personalized styling recommendations.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 text-xs tracking-[0.25em] uppercase font-bold transition-all shadow-xl"
            style={{ backgroundColor: '#C9A227', color: '#10231C' }}
          >
            <span>Store Location &amp; Contact</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
