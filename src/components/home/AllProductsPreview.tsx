import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/lib/data';

export default function AllProductsPreview({ products }: { products: Product[] }) {
  const visibleProducts = products.slice(0, 12);
  if (visibleProducts.length === 0) return null;

  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center md:mb-12">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.55em]" style={{ color: 'var(--color-gold-text)' }}>
            Browse the Catalogue
          </p>
          <div className="flex items-center justify-center gap-5">
            <span className="hidden h-px max-w-[100px] flex-1 sm:block" style={{ backgroundColor: 'rgba(122,95,14,0.3)' }} />
            <h2 className="text-3xl tracking-wide text-ink md:text-[2.25rem]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Explore Our Products
            </h2>
            <span className="hidden h-px max-w-[100px] flex-1 sm:block" style={{ backgroundColor: 'rgba(122,95,14,0.3)' }} />
          </div>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
            Branded fabrics, wedding collections, winter cloth and more from every category.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-brand px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-soft"
          >
            Explore All Products
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
