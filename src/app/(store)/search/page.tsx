import Link from 'next/link';
import { Metadata } from 'next';
import ProductCard from '@/components/product/ProductCard';
import { searchStorefront } from '@/lib/db/storefront';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = '' } = await searchParams;
  const term = q.trim();
  return {
    title: term ? `Search “${term}” | Kamran Cloth House` : 'Search | Kamran Cloth House',
    description: term
      ? `Results for “${term}” at Kamran Cloth House, Saddar Peshawar.`
      : 'Search fabrics, brands and colours at Kamran Cloth House.',
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const term = q.trim();
  const results = await searchStorefront(term);
  const empty =
    results.products.length === 0 && results.categories.length === 0 && results.brands.length === 0;

  return (
    <>
      {/* Header */}
      <section
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}
        className="py-16 text-center"
      >
        <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--color-accent-text)' }}>
          Search
        </p>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-3xl md:text-4xl uppercase tracking-wide mb-3 text-black"
        >
          {term ? `“${term}”` : 'Find Your Fabric'}
        </h1>
        <p className="text-xs tracking-widest uppercase text-zinc-500">
          {empty
            ? 'No matches'
            : `${results.products.length} product${results.products.length === 1 ? '' : 's'}`}
        </p>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!term ? (
            <div className="text-center py-16 max-w-lg mx-auto">
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                Type a fabric, a brand or a colour — <span className="text-black font-medium">winter khaddar</span>,{' '}
                <span className="text-black font-medium">Gul Ahmed</span>,{' '}
                <span className="text-black font-medium">navy</span>. Or start from a category.
              </p>
              <Link
                href="/categories"
                className="inline-block px-8 py-3 text-xs tracking-[0.25em] uppercase bg-black text-white hover:bg-zinc-800 transition-colors font-semibold"
              >
                Browse Categories
              </Link>
            </div>
          ) : empty ? (
            <div className="text-center py-16 border border-zinc-200 max-w-xl mx-auto">
              <p className="text-base mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nothing matched “{term}”
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                Try a shorter word, a brand name, or WhatsApp us — we may still have it in the shop.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/categories"
                  className="px-6 py-3 text-xs tracking-[0.25em] uppercase bg-black text-white hover:bg-zinc-800 transition-colors font-semibold"
                >
                  Browse Categories
                </Link>
                <Link
                  href="/brands"
                  className="px-6 py-3 text-xs tracking-[0.25em] uppercase border border-zinc-300 hover:border-black transition-colors font-semibold"
                >
                  All Brands
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-14">
              {/* Categories & brands that matched */}
              {(results.categories.length > 0 || results.brands.length > 0) && (
                <div className="flex flex-wrap gap-3">
                  {results.categories.map((cat) => (
                    <Link
                      key={`c-${cat.slug}`}
                      href={`/categories/${cat.slug}`}
                      className="px-5 py-3 text-xs tracking-widest uppercase border border-zinc-300 hover:border-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      {cat.name} →
                    </Link>
                  ))}
                  {results.brands.map((brand) => (
                    <Link
                      key={`b-${brand.slug}`}
                      href={`/brands/${brand.slug}`}
                      className="px-5 py-3 text-xs tracking-widest uppercase border border-zinc-300 hover:border-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      {brand.name} →
                    </Link>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div>
                  <p
                    className="text-[11px] tracking-[0.3em] uppercase mb-6 pb-3 border-b border-zinc-200"
                    style={{ color: 'var(--color-fg-muted)' }}
                  >
                    Fabrics
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {results.products.map((product) => (
                      <ProductCard key={product.slug} product={product} showColor />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
