import type { Metadata } from 'next';
import Link from 'next/link';
import ProductGrid from '@/components/product/ProductGrid';
import { getSaleProducts } from '@/lib/db/storefront';
import { getStoreSettings } from '@/lib/db/settings';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Exclusive Sale & Special Offers | Kamran Cloth House — Saddar, Peshawar',
  description:
    'Shop exclusive sale offers and discounts on authentic gents unstitched fabrics, winter collections, shawls and luxury suiting at Kamran Cloth House Peshawar. Cash on Delivery nationwide.',
  alternates: { canonical: '/sale' },
};

export default async function SalePage() {
  const [saleProducts, settings] = await Promise.all([
    getSaleProducts(),
    getStoreSettings(),
  ]);

  return (
    <>
      {/* ── Premium Sale Hero Banner ── */}
      <section
        className="relative overflow-hidden py-14 text-center text-white md:py-20"
        style={{
          backgroundColor: '#0E3B2C',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
      >
        {/* Subtle decorative gold glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: '#C9A227' }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <p
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em]"
              style={{ color: '#C9A227' }}
            >
              SPECIAL CLEARANCE & PROMOTIONS · LIMITED STOCK
            </p>
          </div>

          <h1
            className="mb-4 text-4xl leading-tight text-white md:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Exclusive Sale
          </h1>

          <p
            className="mx-auto max-w-2xl text-sm sm:text-base font-light leading-relaxed mb-6"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Aala aur mayaar pasand kapron par bemisaal riaayat. Authentic original fabrics, winter wool, shawls and wedding suiting at special discounted prices.
          </p>

          {/* Highlights / Trust Chips */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs font-medium">
            <span className="px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-zinc-200">
              🏷️ {saleProducts.length} Deals Active
            </span>
            <span className="px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-zinc-200">
              🚚 Cash on Delivery Nationwide
            </span>
            <span className="px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-zinc-200">
              ✨ 100% Original Brand Fabrics
            </span>
          </div>
        </div>
      </section>

      {/* ── Sale Products Grid ── */}
      <ProductGrid
        products={saleProducts}
        showColor
        showFilters
        showSearch
        whatsappNumber={settings.whatsappNumber}
        emptyMessage="Filhaal koi sale item active nahi hai — fresh collection aur custom deals ke liye WhatsApp par rabta karein."
        emptyAction={
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase transition-all"
              style={{ backgroundColor: '#0E3B2C', color: '#FFF' }}
            >
              Sab Products Dekhein
            </Link>
            {settings.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Assalam-o-Alaikum, mujhe Sale items ki information chahiye.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase border border-[#0E3B2C] text-[#0E3B2C] hover:bg-[#0E3B2C] hover:text-white transition-all"
              >
                WhatsApp Inquiry
              </a>
            )}
          </div>
        }
      />
    </>
  );
}
