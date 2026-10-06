import type { Metadata } from 'next';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import TrustStrip from '@/components/home/TrustStrip';
import WinterBanner from '@/components/home/WinterBanner';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import BestSellers from '@/components/home/BestSellers';
import { getAllProducts, getCategories, getBrands, getBestsellerProducts, getFeaturedProducts } from '@/lib/db/storefront';
import AllProductsPreview from '@/components/home/AllProductsPreview';
import { getHeroContent, getPromoBanner } from '@/lib/db/banners';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function Home() {
  const [categories, hero, promo, brands, bestsellers, featured, allProducts] = await Promise.all([
    getCategories(),
    getHeroContent(),
    getPromoBanner(),
    getBrands(),
    getBestsellerProducts(),
    getFeaturedProducts(),
    getAllProducts(),
  ]);

  // All active categories for the grid (up to 8 — matching reference image)
  const displayCategories = categories.slice(0, 8);

  // Best sellers: prefer bestseller-flagged products, fallback to featured
  const bestsellingProducts = bestsellers.length >= 4 ? bestsellers : [...bestsellers, ...featured].slice(0, 4);

  return (
    <>
      {/* ── 1. HERO CAROUSEL (multi-slide, admin-editable) ─────── */}
      <HeroCarousel hero={hero} />

      {/* ── 2. CATEGORIES GRID (8 tiles) ───────────────────────── */}
      <CategoriesGrid categories={displayCategories} />

      {/* ── 3. WINTER COLLECTION BANNER (left-text / right-icons) ─ */}
      <WinterBanner promo={promo} />

      {/* ── 4. TRUSTED BRANDS CAROUSEL ─────────────────────────── */}
      <BrandsCarousel brands={brands} />

      {/* ── 5. BEST SELLING FABRICS + TAILORING CTA ────────────── */}
      <BestSellers products={bestsellingProducts} />

      {/* Complete catalogue preview — capped so the home page stays quick and balanced. */}
      <AllProductsPreview products={allProducts} />

      {/* ── 6. TRUST STRIP (3-col dark bar) ────────────────────── */}
      <TrustStrip />

      {/* ── 7. FOOTER (rendered in layout) ─────────────────────── */}
    </>
  );
}
