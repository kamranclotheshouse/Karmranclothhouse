'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/lib/data';

const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  bestseller: 'Bestsellers',
} as const;

type SortKey = keyof typeof SORTS;

interface ColorOption {
  key: string;
  name: string;
  hex: string;
}

export default function ProductGrid({
  products,
  showColor = false,
  showFilters = false,
  showSearch = false,
  whatsappNumber,
  emptyMessage = 'Stock for this category is being updated — WhatsApp us for current availability.',
  emptyAction,
}: {
  products: Product[];
  showColor?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  whatsappNumber?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}) {
  const [sort, setSort] = useState<SortKey>('featured');
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Filters self-populate from whatever the products actually carry —
  // no fake entries. Brand row hides itself when a page has 0–1 brands.
  const brandOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.brandSlug && p.brand && !map.has(p.brandSlug)) map.set(p.brandSlug, p.brand);
    }
    return [...map].map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const colorOptions = useMemo(() => {
    const map = new Map<string, ColorOption>();
    for (const p of products) {
      for (const c of p.colors ?? []) {
        const key = c.name?.trim().toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, { key, name: c.name.trim(), hex: c.hex || '#e5e5e5' });
        }
      }
    }
    return [...map.values()];
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (activeBrand && p.brandSlug !== activeBrand) return false;
        const needle = search.trim().toLowerCase();
        if (needle && ![p.name, p.brand, p.category, p.slug].some((value) => value.toLowerCase().includes(needle))) {
          return false;
        }
        if (activeColor && !(p.colors ?? []).some((c) => c.name?.trim().toLowerCase() === activeColor)) {
          return false;
        }
        return true;
      }),
    [products, activeBrand, activeColor, search]
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'bestseller':
        return list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
      default:
        return list;
    }
  }, [filtered, sort]);

  const hasActiveFilters = Boolean(activeBrand || activeColor || search.trim());
  const clearFilters = () => {
    setActiveBrand(null);
    setActiveColor(null);
    setSearch('');
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-line">
        <p className="text-sm text-muted mb-6">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        'Assalam-o-Alaikum! Is category mein colors ki current availability batayein.'
      )}`
    : null;

  return (
    <>
      {/* Sort bar */}
      <div
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'white' }}
        className="sticky top-20 z-40 py-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <p className="text-xs tracking-widest uppercase text-muted">
            {hasActiveFilters ? `${sorted.length} of ${products.length} Product${products.length === 1 ? '' : 's'}` : `${products.length} Product${products.length === 1 ? '' : 's'}`}
          </p>
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs tracking-wider uppercase text-muted font-medium whitespace-nowrap">
              Sort:
            </span>
            {(Object.keys(SORTS) as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                className={`text-xs tracking-wider uppercase px-3 py-1.5 transition-all font-medium rounded-sm whitespace-nowrap ${
                  sort === key
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-cream text-ink hover:bg-brand hover:text-white'
                }`}
              >
                {SORTS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter band — brand + color, self-populated from the products below.
          Colors empty → WhatsApp fallback instead of an empty row. */}
      {showFilters && (showSearch || brandOptions.length > 1 || colorOptions.length > 0 || Boolean(whatsappLink)) && (
        <div style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'white' }} className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-3">
            {showSearch && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="product-catalogue-search" className="text-xs font-medium uppercase tracking-wider text-muted">
                  Find a product
                </label>
                <input
                  id="product-catalogue-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, brand or category…"
                  className="w-full border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand sm:max-w-sm"
                />
              </div>
            )}
            {brandOptions.length > 1 && (
              <div className="flex items-start gap-3">
                <span className="text-xs tracking-wider uppercase text-muted font-medium whitespace-nowrap pt-1.5">
                  Brand:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveBrand(null)}
                    aria-pressed={activeBrand === null}
                    className={`text-xs px-3 py-1.5 transition-all font-medium rounded-full whitespace-nowrap border ${
                      activeBrand === null
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-ink border-line hover:border-brand hover:text-brand'
                    }`}
                  >
                    All
                  </button>
                  {brandOptions.map((b) => (
                    <button
                      key={b.slug}
                      onClick={() => setActiveBrand(activeBrand === b.slug ? null : b.slug)}
                      aria-pressed={activeBrand === b.slug}
                      className={`text-xs px-3 py-1.5 transition-all font-medium rounded-full whitespace-nowrap border ${
                        activeBrand === b.slug
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-ink border-line hover:border-brand hover:text-brand'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorOptions.length > 0 ? (
              <div className="flex items-start gap-3">
                <span className="text-xs tracking-wider uppercase text-muted font-medium whitespace-nowrap pt-1.5">
                  Color:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveColor(null)}
                    aria-pressed={activeColor === null}
                    className={`text-xs px-3 py-1.5 transition-all font-medium rounded-full whitespace-nowrap border ${
                      activeColor === null
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-ink border-line hover:border-brand hover:text-brand'
                    }`}
                  >
                    All
                  </button>
                  {colorOptions.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setActiveColor(activeColor === c.key ? null : c.key)}
                      aria-pressed={activeColor === c.key}
                      title={c.name}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 transition-all font-medium rounded-full whitespace-nowrap border ${
                        activeColor === c.key
                          ? 'bg-cream text-ink border-gold ring-1 ring-gold'
                          : 'bg-white text-ink border-line hover:border-brand'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              whatsappLink && (
                <p className="text-xs text-muted">
                  Colors ke liye WhatsApp par current availability confirm karein —{' '}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-brand hover:text-gold-text font-medium"
                  >
                    WhatsApp karein
                  </a>
                </p>
              )
            )}

            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs tracking-wider uppercase font-medium text-gold-text hover:text-brand underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {sorted.length === 0 ? (
            <div className="text-center py-16 border border-line max-w-xl mx-auto">
              <p className="text-sm text-muted mb-6">
                In filters par koi product nahi mila — filters hata kar dekhein.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={clearFilters}
                  className="text-xs tracking-wider uppercase px-4 py-2 bg-brand text-white hover:bg-brand-deep transition-colors font-medium rounded-sm"
                >
                  Clear filters
                </button>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs tracking-wider uppercase px-4 py-2 border border-line text-ink hover:border-brand hover:text-brand transition-colors font-medium rounded-sm"
                  >
                    WhatsApp karein
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {sorted.map((product) => (
                <ProductCard key={product.slug} product={product} showColor={showColor} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
