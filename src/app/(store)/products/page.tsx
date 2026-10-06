import type { Metadata } from 'next';
import ProductGrid from '@/components/product/ProductGrid';
import { getAllProducts } from '@/lib/db/storefront';
import { getStoreSettings } from '@/lib/db/settings';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Products | Kamran Cloth House — Saddar, Peshawar',
  description: 'Explore all available fabrics, brands and collections at Kamran Cloth House. Cash on Delivery across Pakistan.',
  alternates: { canonical: '/products' },
};

export default async function AllProductsPage() {
  const [products, settings] = await Promise.all([getAllProducts(), getStoreSettings()]);

  return (
    <>
      <section
        className="relative overflow-hidden py-16 text-center text-white md:py-20"
        style={{ backgroundColor: '#0E3B2C', borderBottom: '1px solid rgba(201,162,39,0.3)' }}
      >
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.45em]" style={{ color: '#C9A227' }}>
            {products.length} Products · Every Brand · Every Collection
          </p>
          <h1 className="mb-4 text-4xl leading-tight text-white md:text-5xl lg:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Explore All Products
          </h1>
          <p className="mx-auto max-w-xl text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Browse our complete catalogue of branded fabrics, wedding collections, winter cloth, shawls and more.
          </p>
        </div>
      </section>

      <ProductGrid
        products={products}
        showColor
        showFilters
        showSearch
        whatsappNumber={settings.whatsappNumber}
        emptyMessage="Abhi catalogue update ho raha hai — current stock ke liye WhatsApp karein."
      />
    </>
  );
}
