'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { heroSlideToContent, type HeroContent } from '@/lib/hero';

interface HeroCarouselProps {
  hero: HeroContent;
}

const HERO_BADGES = [
  {
    label: 'Original\nBranded Fabrics',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'In-House\nTailoring',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
      </svg>
    ),
  },
  {
    label: 'Cash on Delivery\nAll Over Pakistan',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    label: 'Trusted by\nThousands',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function HeroCarousel({ hero }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const slides = hero.slides.filter((s) => s.isActive);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    intervalRef.current = setInterval(() => {
      if (!isHovering) {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, isHovering]);

  const current = slides[Math.min(currentIndex, slides.length - 1)] ?? hero.slides[0];
  const content = heroSlideToContent(current);

  const goToSlide = (index: number) => setCurrentIndex(index);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section
      className="relative flex min-h-[78svh] flex-col overflow-hidden bg-brand text-white md:min-h-[100svh]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background Slides — Seamless Layered Crossfade + Subtle Ken Burns Drift */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
            }`}
            style={{
              transition: 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.titleLine1 || 'Kamran Cloth House — Saddar, Peshawar'}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{
                transform: isActive ? 'scale(1.04)' : 'scale(1.0)',
                transition: 'transform 7000ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            />
          </div>
        );
      })}

      {/* Multi-stop gradient — heavier on left for text, subtle on right */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(100deg, rgba(10,43,32,0.95) 0%, rgba(10,43,32,0.80) 40%, rgba(10,43,32,0.40) 70%, rgba(10,43,32,0.15) 100%)',
        }}
      />

      {/* Gold accent line — left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 z-[2]"
        style={{ backgroundColor: 'var(--color-gold)', opacity: 0.6 }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 py-14 sm:px-8 sm:py-16 md:py-10 lg:py-14">
          <div key={currentIndex} className="hero-carousel__copy max-w-2xl animate-fade-in-up">
            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-2 sm:mb-6 sm:gap-3">
              <div className="h-px w-8 shrink-0 sm:w-12" style={{ backgroundColor: 'var(--color-gold)' }} />
              <p
                className="text-[9px] tracking-[0.3em] uppercase font-semibold sm:text-[11px] sm:tracking-[0.5em]"
                style={{ color: 'var(--color-gold)' }}
              >
                {content.eyebrow}
              </p>
            </div>

            {/* Headline */}
            <h1
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="hero-carousel__title mb-5 max-w-full break-words text-[2.65rem] leading-[1.02] drop-shadow-lg sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span style={{ color: '#C9A227' }}>{content.titleLine1}</span>
              {content.titleLine2 && (
                <>
                  <br />
                  <span style={{ color: '#C9A227' }}>{content.titleLine2}</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="hero-carousel__subtitle mb-8 max-w-lg text-xs leading-relaxed font-light drop-shadow sm:mb-10 sm:text-base md:text-lg"
               style={{ color: 'rgba(255,255,255,0.85)' }}>
              {content.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={content.ctaPrimaryHref || '/categories'}
                className="group btn-shimmer inline-flex w-full items-center justify-center gap-3 px-6 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-2xl hover:shadow-[0_8px_30px_rgba(201,162,39,0.35)] hover:-translate-y-0.5 sm:w-auto sm:px-9 sm:py-4 sm:text-[11px] sm:tracking-[0.25em]"
                style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-ink)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8901f'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-gold)'; }}
              >
                {content.ctaPrimaryLabel || 'Shop Collections'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                     className="transition-transform duration-300 group-hover:translate-x-1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {content.ctaSecondaryLabel && (
                <Link
                  href={content.ctaSecondaryHref || '/categories'}
                  className="group btn-shimmer inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,162,39,0.25)] sm:w-auto sm:px-9 sm:py-4 sm:text-[11px] sm:tracking-[0.25em]"
                  style={{ border: '1px solid #C9A227', color: '#C9A227' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.backgroundColor = '#C9A227';
                    el.style.color = '#10231C';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.backgroundColor = 'transparent';
                    el.style.borderColor = '#C9A227';
                    el.style.color = '#C9A227';
                  }}
                >
                  {content.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges bar */}
      <div
        className="relative z-10 hidden md:block"
        style={{ borderTop: '1px solid rgba(201,162,39,0.2)', backgroundColor: 'rgba(10,43,32,0.6)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5">
          <ul className="grid grid-cols-4 gap-6">
            {HERO_BADGES.map((badge) => (
              <li key={badge.label} className="flex items-center gap-3.5">
                <span style={{ color: 'var(--color-gold)' }} className="flex-shrink-0">
                  {badge.icon}
                </span>
                <span
                  className="text-[11px] leading-snug font-medium whitespace-pre-line"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {badge.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Carousel Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white transition-all duration-200 sm:left-5 sm:h-10 sm:w-10"
            style={{ border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(10,43,32,0.5)' }}
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white transition-all duration-200 sm:right-5 sm:h-10 sm:w-10"
            style={{ border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(10,43,32,0.5)' }}
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 md:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8' : 'w-3 opacity-50 hover:opacity-75'
                }`}
                style={{ backgroundColor: i === currentIndex ? 'var(--color-gold)' : 'white' }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
