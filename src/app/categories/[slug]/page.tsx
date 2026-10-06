import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductGrid from '@/components/product/ProductGrid';
import { getCategory, getProductsByCategory, listTaxonomySlugs } from '@/lib/db/storefront';
import { getStoreSettings } from '@/lib/db/settings';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await listTaxonomySlugs('categories');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  const name = cat?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} | Kamran Cloth House — Saddar, Peshawar`,
    description: cat?.description ?? `Browse ${name} at Kamran Cloth House, Saddar Peshawar. Cash on Delivery nationwide.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();

  const categoryProducts = await getProductsByCategory(slug);
  const settings = await getStoreSettings();

  return (
    <>
      {/* ── Category Header ── */}
      <section
        style={{
          backgroundColor: '#0E3B2C',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
        className="py-16 md:py-20 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase mb-6 transition-opacity hover:opacity-75"
            style={{ color: '#C9A227' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Categories
          </Link>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight drop-shadow-md"
          >
            {cat.name}
          </h1>

          <p className="text-xs tracking-[0.35em] uppercase mb-4 font-semibold" style={{ color: '#C9A227' }}>
            {cat.sub}
          </p>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {cat.description}
          </p>
        </div>
      </section>

      {/* ── Products Grid with Brand + Color Filters ── */}
      <ProductGrid
        products={categoryProducts}
        showColor
        showFilters
        whatsappNumber={settings.whatsappNumber}
      />
    </>
  );
}
