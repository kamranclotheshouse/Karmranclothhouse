import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetails from '@/components/product/ProductDetails';
import { getAllProducts, getProduct, listProductSlugs } from '@/lib/db/storefront';
import { getStoreSettings } from '@/lib/db/settings';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Built ahead of time from the database, then re-rendered at most once a minute.
 * An admin edit also calls `revalidatePath` (see /api/admin/products), so the
 * change is usually live immediately and always within `revalidate` seconds.
 */
export const revalidate = 60;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await listProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found | Kamran Cloth House' };

  return {
    title: `${product.name} — ${product.brand} | Kamran Cloth House`,
    description: `${product.description.slice(0, 155)} Cash on Delivery across Pakistan from Kamran Cloth House, Saddar Peshawar.`,
    openGraph: {
      title: `${product.name} | Kamran Cloth House`,
      description: product.description.slice(0, 155),
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings, allProducts] = await Promise.all([
    getProduct(slug),
    getStoreSettings(),
    getAllProducts(),
  ]);
  if (!product) notFound();

  // Same category first, then anything else worth showing — never the product
  // itself, never more than four cards.
  const sameCategory = allProducts.filter(
    (item) => item.categorySlug === product.categorySlug && item.slug !== slug
  );
  const fill = allProducts.filter(
    (item) =>
      item.slug !== slug &&
      !sameCategory.some((other) => other.slug === item.slug) &&
      (item.isFeatured || item.isBestseller)
  );
  const related = [...sameCategory, ...fill].slice(0, 4);

  return <ProductDetails product={product} settings={settings} related={related} />;
}
