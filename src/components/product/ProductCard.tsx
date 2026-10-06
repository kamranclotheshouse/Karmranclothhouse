'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  showBrand?: boolean;
  showColor?: boolean;
}

export default function ProductCard({ product, showBrand = true, showColor = false }: ProductCardProps) {
  const image = product.images?.[0] ?? '/images/kapra.jpg';

  return (
    <div
      className="group relative bg-white flex flex-col transition-all duration-350 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(10,43,32,0.12)] hover:border-[#C9A227]"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Badge */}
      {product.badge && (
        <span
          className="absolute top-3 left-3 z-10 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1"
          style={{ backgroundColor: '#C9A227', color: '#10231C' }}
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

      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative overflow-hidden bg-zinc-50" style={{ aspectRatio: '3/4' }}>
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-[#0E3B2C]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {showBrand && (
          <p
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1"
            style={{ color: '#7A5F0E' }}
          >
            {product.brand}
          </p>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3
            className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 mb-2 hover:opacity-75 transition-opacity"
            style={{ color: '#10231C', fontFamily: "'Playfair Display', serif" }}
          >
            {product.name}
          </h3>
        </Link>

        {showColor && product.colors?.length > 0 && (
          <p className="text-[11px] mb-2" style={{ color: 'rgba(16, 35, 28, 0.6)' }}>
            Colours: {product.colors.slice(0, 3).map((color) => color.name).join(' · ')}
            {product.colors.length > 3 && ` · +${product.colors.length - 3} more`}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-sm font-bold" style={{ color: '#10231C' }}>
            Rs. {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs line-through" style={{ color: 'rgba(16, 35, 28, 0.45)' }}>
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
          View &amp; Order
        </Link>
      </div>
    </div>
  );
}
