import { NextResponse } from 'next/server';
import { getHeroContent, readHeroSlidesFresh, updateHeroSlides, getPromoBanner, readPromoBannerFresh, updatePromoBanner } from '@/lib/db/banners';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';
import { hasHeroErrors, validateHero, type HeroSlideFormValues } from '@/lib/admin/validate-hero';
import type { HeroSlide } from '@/lib/hero';

export const dynamic = 'force-dynamic';

const SLIDE_FIELDS: (keyof HeroSlideFormValues)[] = [
  'imageUrl',
  'eyebrow',
  'titleLine1',
  'titleLine2',
  'subtitle',
  'ctaPrimaryLabel',
  'ctaPrimaryHref',
  'ctaSecondaryLabel',
  'ctaSecondaryHref',
];

function readSlideValues(body: Record<string, unknown>, prefix = ''): Partial<HeroSlideFormValues> {
  const values = {} as Partial<HeroSlideFormValues>;
  for (const field of SLIDE_FIELDS) {
    const key = prefix + field;
    const value = body[key];
    values[field] = typeof value === 'string' ? value : value == null ? '' : String(value);
  }
  return values;
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const [hero, promo] = await Promise.all([readHeroSlidesFresh(), readPromoBannerFresh()]);
    return ok({ hero, promo });
  } catch (error) {
    console.error('GET /api/admin/home failed:', error);
    return fail('Hero content could not be loaded. Check the database connection.', 500);
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  // Handle hero slides (array) and promo banner
  const isSlideArray = Array.isArray(body.slides);
  const hasPromo = body.promo && typeof body.promo === 'object';

  const results: { hero?: unknown; promo?: unknown } = {};

  if (isSlideArray) {
    const slides = body.slides as Array<Record<string, unknown>>;
    const validatedSlides: Partial<HeroSlide>[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const fields = {} as HeroSlideFormValues;
      for (const field of SLIDE_FIELDS) {
        const value = slide[field];
        fields[field] = typeof value === 'string' ? value : value == null ? '' : String(value);
      }
      // Identity + ordering flags the editor sends — without these, hiding a
      // slide (isActive) or reordering would silently revert on save.
      const values: Partial<HeroSlide> = { ...fields };
      if (typeof slide.id === 'string' && slide.id) values.id = slide.id;
      values.sortOrder = typeof slide.sortOrder === 'number' ? slide.sortOrder : i;
      values.isActive = slide.isActive !== false;

      const hasContent = SLIDE_FIELDS.some((f) => fields[f].trim().length > 0);
      if (hasContent || i === 0) {
        const errors = validateHero(fields);
        if (Object.keys(errors).length > 0) {
          return NextResponse.json({ ok: false, errors: { [`slides[${i}]`]: errors } }, { status: 422 });
        }
        validatedSlides.push(values);
      }
    }

    if (validatedSlides.length === 0) {
      return fail('At least one hero slide with content is required.', 422);
    }

    try {
      const hero = await updateHeroSlides(validatedSlides);
      results.hero = hero;
    } catch (error) {
      console.error('PUT /api/admin/home (slides) failed:', error);
      return fail('The hero carousel could not be saved. Nothing was changed — try again.', 500);
    }
  }

  if (hasPromo) {
    const promoBody = body.promo as Record<string, unknown>;
    const promoValues = {} as HeroSlideFormValues;
    for (const field of SLIDE_FIELDS) {
      const value = promoBody[field];
      promoValues[field] = typeof value === 'string' ? value : value == null ? '' : String(value);
    }
    // Promo banner can be empty (to clear it)
    const hasPromoContent = SLIDE_FIELDS.some((f) => promoValues[f].trim().length > 0);
    if (hasPromoContent) {
      const errors = validateHero(promoValues);
      if (Object.keys(errors).length > 0) {
        return NextResponse.json({ ok: false, errors: { promo: errors } }, { status: 422 });
      }
    }

    try {
      await updatePromoBanner(promoValues);
      results.promo = await readPromoBannerFresh();
    } catch (error) {
      console.error('PUT /api/admin/home (promo) failed:', error);
      return fail('The promo banner could not be saved.', 500);
    }
  }

  // Invalidate home page cache
  revalidateCatalogue();
  return ok(results);
}