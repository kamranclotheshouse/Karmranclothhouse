'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/data';

interface BestSellersProps {
  products: Product[];
}

/* ── Product Card ─────────────────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? '/images/kapra.jpg';
  return (
    <div
      className="group relative bg-white flex flex-col transition-all duration-350 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(10,43,32,0.12)] hover:border-[#C9A227]"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Badge */}
      {product.badge && (
        <span
          className="absolute top-3 left-3 z-10 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-ink)' }}
        >
          {product.badge}
        </span>
      )}

      {/* Wishlist */}
      <button
        type="button"
        aria-label={`Wishlist ${product.name}`}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md border border-neutral-200/90 text-[#0E3B2C] hover:text-red-600 hover:border-red-300 hover:bg-red-50 hover:scale-110 active:scale-90 transition-all duration-200 group/heart"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover/heart:scale-110"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative overflow-hidden bg-zinc-50" style={{ aspectRatio: '3/4' }}>
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-[#0E3B2C]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <p
          className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 transition-colors duration-300 group-hover:text-amber-800"
          style={{ color: 'var(--color-gold-text)' }}
        >
          {product.brand}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3
            className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 mb-3 hover:opacity-75 transition-opacity"
            style={{ color: 'var(--color-ink)', fontFamily: "'Playfair Display', serif" }}
          >
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
            Rs. {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs line-through" style={{ color: 'var(--color-fg-muted)' }}>
              Rs. {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="btn-shimmer block w-full text-center py-2.5 text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#0E3B2C', color: '#FFFFFF' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.backgroundColor = '#C9A227';
            el.style.color = '#10231C';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.backgroundColor = '#0E3B2C';
            el.style.color = '#FFFFFF';
          }}
        >
          Order Now
        </Link>
      </div>
    </div>
  );
}

/* ── Tailoring Panel ──────────────────────────────────────────────── */
function TailoringPanel() {
  return (
    <div
      className="relative overflow-hidden flex flex-col h-full min-h-[360px]"
      style={{ backgroundColor: '#0E3B2C' }}
    >
      {/* Background photo */}
      <Image
        src="/images/tailoring.jpg"
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 20vw"
        className="object-cover object-center"
      />
      {/* Dark green overlay — text readable rakhe, photo jhalke mein dikhe */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14,59,44,0.72)' }} />

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 z-10">
        <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: '#C9A227' }}>
          <line x1="0" y1="0" x2="96" y2="0" />
          <line x1="96" y1="0" x2="96" y2="96" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 z-10">
        <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: '#C9A227' }}>
          <line x1="0" y1="0" x2="0" y2="96" />
          <line x1="0" y1="96" x2="96" y2="96" />
        </svg>
      </div>

      {/* Gold top accent */}
      <div className="relative z-10 h-[3px]" style={{ backgroundColor: '#C9A227' }} />

      <div className="relative z-10 flex flex-col flex-1 p-6 md:p-8">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          <p
            className="text-[10px] tracking-[0.45em] uppercase font-semibold"
            style={{ color: '#C9A227' }}
          >
            In-House
          </p>
        </div>

        <h3
          style={{ fontFamily: "'Playfair Display', serif", color: '#FFFFFF' }}
          className="text-2xl md:text-3xl mb-2 leading-tight"
        >
          Tailoring<br />Service
        </h3>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Perfect Stitching. Perfect Fit.
        </p>

        <ul className="space-y-3 mb-8">
          {[
            'Expert Master Tailors',
            'Custom Fitting',
            'Traditional & Modern',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#C9A227' }}
              />
              <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Link
            href="/tailoring"
            className="inline-flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 group"
            style={{ border: '1px solid #C9A227', color: '#C9A227', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = '#C9A227';
              el.style.color = '#10231C';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = 'transparent';
              el.style.color = '#C9A227';
            }}
          >
            Learn More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 className="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) return null;
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <p
            className="text-[10px] tracking-[0.55em] uppercase mb-4 font-semibold"
            style={{ color: 'var(--color-gold-text)' }}
          >
            Featured Products
          </p>
          <div className="flex items-center justify-center gap-5">
            <span className="hidden sm:block h-px flex-1 max-w-[100px]" style={{ backgroundColor: 'rgba(122,95,14,0.3)' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl md:text-[2.25rem] text-ink tracking-wide">
              Best Selling Fabrics
            </h2>
            <span className="hidden sm:block h-px flex-1 max-w-[100px]" style={{ backgroundColor: 'rgba(122,95,14,0.3)' }} />
          </div>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
          {/* Products — 4 cards */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {displayProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          {/* Tailoring panel */}
          <div className="lg:col-span-1">
            <TailoringPanel />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="group btn-shimmer inline-flex items-center gap-3 px-10 py-4 text-[11px] font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-md hover:-translate-y-0.5 hover:shadow-xl"
            style={{ backgroundColor: '#0E3B2C', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = '#C9A227';
              el.style.color = '#10231C';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = '#0E3B2C';
              el.style.color = '#FFFFFF';
            }}
          >
            View All Products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
