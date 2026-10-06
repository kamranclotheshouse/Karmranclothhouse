'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { HeroSlide } from '@/lib/hero';

interface WinterBannerProps {
  promo: HeroSlide | null;
}

const WINTER_FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
      </svg>
    ),
    title: 'Warm',
    sub: 'Comfort',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: 'Premium',
    sub: 'Quality',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    title: 'Styles',
    sub: 'That Last',
  },
];

export default function WinterBanner({ promo }: WinterBannerProps) {
  const imageUrl = promo?.imageUrl ?? '/images/winter-fabric.jpg';
  const title = promo?.titleLine1 ?? 'Winter Collection 2026';
  const subtitle = promo?.subtitle ?? 'Premium Warmth. Timeless Style.';
  const ctaLabel = promo?.ctaPrimaryLabel ?? 'Explore Winter Fabrics';
  const ctaHref = promo?.ctaPrimaryHref ?? '/categories/winter-fabric';

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-green-deep)' }}
    >
      {/* Background image — enhanced visibility especially on the right side */}
      <Image
        src={imageUrl}
        alt="Winter Collection 2026 — Kamran Cloth House"
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover object-right md:object-center transition-transform duration-1000 ease-out group-hover:scale-105"
        style={{ opacity: 0.8 }}
      />

      {/* Gradient overlay: deep opaque green on left for text contrast, fading to gentle transparency on the right to reveal the fabric image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(10,43,32,0.97) 0%, rgba(10,43,32,0.88) 35%, rgba(10,43,32,0.45) 65%, rgba(10,43,32,0.15) 100%)',
        }}
      />
      {/* Top and bottom subtle vignettes for clean section separation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,43,32,0.35) 0%, transparent 25%, transparent 75%, rgba(10,43,32,0.35) 100%)',
        }}
      />

      {/* Gold top border line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--color-gold)', opacity: 0.5 }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-16">

          {/* Left — Text */}
          <div className="flex-1 max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--color-gold)' }} />
              <p
                className="text-[10px] tracking-[0.55em] uppercase font-semibold"
                style={{ color: 'var(--color-gold)' }}
              >
                New Season
              </p>
            </div>

            <h2
              style={{ fontFamily: "'Playfair Display', serif", color: '#FFFFFF' }}
              className="text-4xl md:text-5xl lg:text-6xl mb-5 leading-[1.05]"
            >
              {title}
            </h2>

            <p className="text-base md:text-lg mb-9 leading-relaxed font-light max-w-md" style={{ color: '#E4E4E7' }}>
              {subtitle}
            </p>

            <Link
              href={ctaHref}
              className="group btn-shimmer inline-flex items-center gap-3 px-8 py-4 text-xs font-semibold tracking-[0.25em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,162,39,0.25)]"
              style={{
                border: '1px solid #C9A227',
                color: '#C9A227',
                backgroundColor: 'transparent',
              }}
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
              {ctaLabel}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Divider */}
          <div
            className="hidden md:block w-px self-stretch opacity-30 shadow-[0_0_8px_rgba(201,162,39,0.3)]"
            style={{ backgroundColor: '#C9A227' }}
          />

          {/* Right — Feature icons */}
          <div className="flex flex-row md:flex-col gap-6 md:gap-8 justify-around md:justify-center">
            {WINTER_FEATURES.map((feat) => (
              <div key={feat.title} className="group/feat flex flex-col items-center text-center gap-2.5 min-w-[85px] transition-transform duration-300 hover:-translate-y-1">
                <div
                  className="w-13 h-13 p-3 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-md transition-all duration-300 group-hover/feat:scale-110 group-hover/feat:shadow-[0_0_18px_rgba(201,162,39,0.45)]"
                  style={{
                    backgroundColor: 'rgba(10, 43, 32, 0.65)',
                    border: '1.5px solid rgba(201, 162, 39, 0.45)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                  }}
                >
                  <span style={{ color: '#C9A227' }}>{feat.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]" style={{ color: '#FFFFFF' }}>{feat.title}</p>
                  <p className="text-[11px] mt-1 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" style={{ color: '#E4E4E7' }}>{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ backgroundColor: 'var(--color-gold)', opacity: 0.2 }} />
    </section>
  );
}
