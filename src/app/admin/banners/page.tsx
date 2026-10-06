import { getHeroContent, getPromoBanner } from '@/lib/db/banners';
import { HeroEditor } from '@/components/admin/HeroEditor';

export const dynamic = 'force-dynamic';

/**
 * Server component: the hero row is read straight from the database so the form
 * always opens on what customers are currently seeing. Saving goes through
 * `PUT /api/admin/home`, which revalidates the storefront.
 *
 * Note: announcement bar and contact details moved to /admin/settings — this
 * page is homepage copy only.
 */
export default async function AdminHomePage() {
  const [hero, promo] = await Promise.all([getHeroContent(), getPromoBanner()]);
  return <HeroEditor hero={hero} promo={promo} />;
}
