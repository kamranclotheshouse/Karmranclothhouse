import Link from 'next/link';
import { Metadata } from 'next';
import ProductGrid from '@/components/product/ProductGrid';
import { getBrand, getProductsByBrand, listTaxonomySlugs } from '@/lib/db/storefront';
import { getStoreSettings } from '@/lib/db/settings';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await listTaxonomySlugs('brands');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  const name = brand?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} Fabric Collection | Kamran Cloth House — Saddar, Peshawar`,
    description: `Browse 100% original ${name} unstitched fabric collection at Kamran Cloth House, Saddar Peshawar. Cash on Delivery across Pakistan.`,
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  const brandName = brand?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const brandProducts = await getProductsByBrand(slug);
  const settings = await getStoreSettings();

  return (
    <>
      {/* ── Brand Header ── */}
      <section
        style={{
          backgroundColor: '#0E3B2C',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
        className="py-16 md:py-20 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase mb-6 transition-opacity hover:opacity-75"
            style={{ color: '#C9A227' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Brands
          </Link>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight drop-shadow-md"
          >
            {brandName}
          </h1>

          <p className="text-xs tracking-[0.35em] uppercase font-semibold" style={{ color: '#C9A227' }}>
            {brand ? `${brand.tag} · Available at Saddar Peshawar` : 'Available at Kamran Cloth House · Saddar Peshawar'}
          </p>
        </div>
      </section>

      {/* ── Products Section ── */}
      {brandProducts.length === 0 ? (
        <section className="py-20 bg-white">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div
              className="p-10 text-center"
              style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-cream)' }}
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,162,39,0.15)', color: '#C9A227' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>

              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-2xl text-ink mb-3"
              >
                In-Store Stock Available
              </h2>

              <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
                We carry a full range of authentic <strong>{brandName}</strong> fabrics in our Shafi Market boutique. Contact us on WhatsApp for live photo swatches and instant orders.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`https://wa.me/923000000000?text=${encodeURIComponent(
                    `السلام علیکم، مجھے ${brandName} کے fabric designs دیکھنے ہیں۔`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all shadow-md"
                  style={{ backgroundColor: '#0E7C6E' }}
                >
                  Inquire on WhatsApp
                </a>
                <Link
                  href="/brands"
                  className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-ink border border-line hover:border-ink transition-colors"
                >
                  Browse Other Brands
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <ProductGrid
          products={brandProducts}
          showColor
          showFilters
          whatsappNumber={settings.whatsappNumber}
        />
      )}
    </>
  );
}
