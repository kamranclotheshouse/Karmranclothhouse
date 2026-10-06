import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { getCategories } from '@/lib/db/storefront';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Categories | Kamran Cloth House — Premium Men\'s Fabric',
  description:
    'Browse all fabric categories — Kapra, Cotton, Dulha Design, Winter Fabric, Summer Fabric, Coats, Waistcoats, and Shawls at Kamran Cloth House, Saddar Peshawar.',
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

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
        {/* Subtle decorative background gradient */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(201,162,39,0.4) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
            <p className="text-[10px] tracking-[0.45em] uppercase font-semibold" style={{ color: '#C9A227' }}>
              {categories.length} Handcrafted Collections
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight drop-shadow-md"
          >
            Fabric Categories
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            From everyday unstitched fabrics to royal bridal groom wear — find your perfect cloth for every season, wedding, and occasion.
          </p>
        </div>
      </section>

      {/* ── Category Cards Grid ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col bg-white transition-all duration-350 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-[#C9A227]"
                style={{
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Category Thumbnail Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to top, rgba(10,43,32,0.6) 0%, transparent 60%)',
                    }}
                  />
                  <span
                    className="absolute bottom-3 left-3 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1"
                    style={{ backgroundColor: '#C9A227', color: '#10231C' }}
                  >
                    Collection
                  </span>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h2
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-lg md:text-xl font-medium mb-1 text-ink group-hover:text-brand transition-colors"
                    >
                      {cat.name}
                    </h2>
                    <p
                      className="text-[10px] tracking-[0.2em] uppercase mb-3 font-semibold"
                      style={{ color: '#7A5F0E' }}
                    >
                      {cat.sub}
                    </p>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(16, 35, 28, 0.65)' }}>
                      {cat.description}
                    </p>
                  </div>

                  <div
                    className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs tracking-[0.2em] uppercase font-semibold group-hover:translate-x-0.5 transition-transform"
                    style={{ color: '#0E3B2C' }}
                  >
                    <span>Explore Collection</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
