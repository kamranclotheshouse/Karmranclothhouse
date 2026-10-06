'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Brand } from '@/lib/data';

interface BrandsCarouselProps {
  brands: Brand[];
}

function BrandTile({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group flex-shrink-0 flex flex-col items-center justify-center px-6 py-5 transition-all duration-350 min-w-[130px] md:min-w-[150px] hover:-translate-y-1 hover:shadow-md"
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'white',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = '#C9A227';
        el.style.backgroundColor = 'var(--color-cream)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = 'var(--color-border)';
        el.style.backgroundColor = 'white';
      }}
    >
      <span
        className="text-sm font-semibold text-center leading-tight transition-all duration-300 group-hover:scale-105"
        style={{ fontFamily: "'Playfair Display', serif", color: 'var(--color-ink)', letterSpacing: '0.03em' }}
      >
        {brand.name}
      </span>
      <span
        className="text-[10px] mt-1 text-center tracking-wide transition-colors duration-300 group-hover:text-amber-800"
        style={{ color: 'var(--color-fg-muted)' }}
      >
        {brand.tag}
      </span>
    </Link>
  );
}

export default function BrandsCarousel({ brands }: BrandsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 360 : -360, behavior: 'smooth' });
    setTimeout(updateScrollState, 350);
  };

  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <p
            className="text-[10px] tracking-[0.55em] uppercase mb-4 font-semibold"
            style={{ color: 'var(--color-gold-text)' }}
          >
            Our Brands
          </p>
          <div className="flex items-center justify-center gap-5">
            <span
              className="hidden sm:block h-px flex-1 max-w-[100px]"
              style={{ backgroundColor: 'rgba(122,95,14,0.3)' }}
            />
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-3xl md:text-[2.25rem] text-ink tracking-wide"
            >
              Trusted Fabric Brands
            </h2>
            <span
              className="hidden sm:block h-px flex-1 max-w-[100px]"
              style={{ backgroundColor: 'rgba(122,95,14,0.3)' }}
            />
          </div>
        </div>

        {/* Scrollable carousel */}
        <div className="relative flex items-stretch gap-0">
          {/* Prev button */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll brands left"
            className="flex-shrink-0 w-10 flex items-center justify-center transition-all duration-200 disabled:opacity-25"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'white',
              borderRight: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-ink)' }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex flex-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', gap: '0px' }}
          >
            {brands.map((brand) => (
              <BrandTile key={brand.slug} brand={brand} />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll brands right"
            className="flex-shrink-0 w-10 flex items-center justify-center transition-all duration-200 disabled:opacity-25"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'white',
              borderLeft: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-ink)' }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* View all */}
        <div className="text-center mt-8">
          <Link
            href="/brands"
            className="text-[11px] font-semibold tracking-[0.3em] uppercase transition-opacity hover:opacity-60"
            style={{ color: 'var(--color-gold-text)' }}
          >
            View All Brands →
          </Link>
        </div>
      </div>
    </section>
  );
}
