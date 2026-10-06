import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/data';

interface CategoriesGridProps {
  categories: Category[];
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section heading */}
        <div className="text-center mb-12">
          <p
            className="text-[10px] tracking-[0.55em] uppercase mb-4 font-semibold"
            style={{ color: 'var(--color-gold-text)' }}
          >
            Shop by Category
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
              Explore Our Collections
            </h2>
            <span
              className="hidden sm:block h-px flex-1 max-w-[100px]"
              style={{ backgroundColor: 'rgba(122,95,14,0.3)' }}
            />
          </div>
        </div>

        {/* Category tiles — 2 on mobile, 3 on tablet, 6 on desktop (6 categories fill the row evenly) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group block overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(10,43,32,0.18)] hover:ring-1 hover:ring-[#C9A227]"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
            >
              {/* Image container */}
              <div className="relative overflow-hidden bg-zinc-100" style={{ aspectRatio: '3/4' }}>
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Gradient overlay at bottom */}
                <div
                  className="absolute inset-x-0 bottom-0 h-2/3 transition-opacity duration-300 group-hover:opacity-90"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(10,43,32,0.95) 0%, rgba(10,43,32,0.45) 55%, transparent 100%)',
                  }}
                />
                {/* Category label — overlaid on image */}
                <div className="absolute inset-x-0 bottom-0 px-2 py-3 text-center transition-transform duration-300 group-hover:-translate-y-0.5">
                  <span className="block text-[11px] md:text-xs font-semibold leading-tight text-white transition-colors duration-300 drop-shadow group-hover:text-[#C9A227]">
                    {cat.name}
                  </span>
                  <span className="mx-auto mt-1.5 block h-px w-6 bg-[#C9A227] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
