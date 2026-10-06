/**
 * Banners — hero carousel slides + promo/winter banner.
 *
 * Server-only: never import from a "use client" file.
 * The client editor talks to `PUT /api/admin/home` instead.
 */
import { cache } from 'react';
import { query } from './driver';
import { DEFAULT_HERO_CONTENT, type HeroSlide, type HeroContent } from '../hero';

interface BannerRow {
  id: string;
  placement: string;
  image_url: string | null;
  eyebrow: string | null;
  title_line1: string | null;
  title_line2: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  cta_secondary_text: string | null;
  cta_secondary_link: string | null;
  sort_order: number;
  is_active: boolean;
}

const text = (value: string | null | undefined, fallback: string): string =>
  value === null || value === undefined || value.trim() === '' ? fallback : value;

function toHeroSlide(row: BannerRow): HeroSlide {
  return {
    id: row.id,
    imageUrl: text(row.image_url, DEFAULT_HERO_CONTENT.slides[0].imageUrl),
    eyebrow: text(row.eyebrow, DEFAULT_HERO_CONTENT.slides[0].eyebrow),
    titleLine1: text(row.title_line1, DEFAULT_HERO_CONTENT.slides[0].titleLine1),
    titleLine2: text(row.title_line2, DEFAULT_HERO_CONTENT.slides[0].titleLine2),
    subtitle: text(row.subtitle, DEFAULT_HERO_CONTENT.slides[0].subtitle),
    ctaPrimaryLabel: text(row.cta_text, DEFAULT_HERO_CONTENT.slides[0].ctaPrimaryLabel),
    ctaPrimaryHref: text(row.cta_link, DEFAULT_HERO_CONTENT.slides[0].ctaPrimaryHref),
    ctaSecondaryLabel: text(row.cta_secondary_text, DEFAULT_HERO_CONTENT.slides[0].ctaSecondaryLabel),
    ctaSecondaryHref: text(row.cta_secondary_link, DEFAULT_HERO_CONTENT.slides[0].ctaSecondaryHref),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function toPromoBanner(row: BannerRow | undefined) {
  if (!row) return null;
  return {
    id: row.id,
    imageUrl: text(row.image_url, ''),
    eyebrow: text(row.eyebrow, ''),
    titleLine1: text(row.title_line1, ''),
    titleLine2: text(row.title_line2, ''),
    subtitle: text(row.subtitle, ''),
    ctaPrimaryLabel: text(row.cta_text, ''),
    ctaPrimaryHref: text(row.cta_link, ''),
    ctaSecondaryLabel: text(row.cta_secondary_text, ''),
    ctaSecondaryHref: text(row.cta_secondary_link, ''),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

/** All active hero slides, ordered by sort_order. */
async function readHeroSlides(): Promise<HeroSlide[]> {
  const rows = await query<BannerRow>(
    `SELECT id, placement, image_url, eyebrow, title_line1, title_line2, subtitle,
            cta_text, cta_link, cta_secondary_text, cta_secondary_link, sort_order, is_active
     FROM banners
     WHERE placement = 'hero' AND is_active = TRUE
     ORDER BY sort_order ASC, id ASC`
  );
  return rows.map(toHeroSlide);
}

async function readHeroContent(): Promise<HeroContent> {
  const slides = await readHeroSlides();
  return { slides: slides.length > 0 ? slides : DEFAULT_HERO_CONTENT.slides };
}

/** Cached per request — the home page and its metadata both want it. */
export const getHeroContent = cache(readHeroContent);

/** Uncached version for admin APIs that need fresh data after writes. */
export async function readHeroSlidesFresh(): Promise<HeroSlide[]> {
  return readHeroSlides();
}

/** Single promo/winter banner (placement = 'promo'). */
async function readPromoBanner() {
  const rows = await query<BannerRow>(
    `SELECT id, placement, image_url, eyebrow, title_line1, title_line2, subtitle,
            cta_text, cta_link, cta_secondary_text, cta_secondary_link, sort_order, is_active
     FROM banners
     WHERE placement = 'promo' AND is_active = TRUE
     ORDER BY sort_order ASC, id ASC
     LIMIT 1`
  );
  return toPromoBanner(rows[0]);
}

/** Uncached version for admin APIs that need fresh data after writes. */
export async function readPromoBannerFresh(): Promise<ReturnType<typeof readPromoBanner>> {
  return readPromoBanner();
}

export const getPromoBanner = cache(readPromoBanner);

/**
 * Update/replace the entire hero carousel. Expects an array of slides (at least one).
 * Deletes existing hero rows not in the new list, upserts the rest.
 */
export async function updateHeroSlides(slides: Partial<HeroSlide>[]): Promise<HeroContent> {
  if (!slides || slides.length === 0) {
    throw new Error('At least one hero slide is required');
  }

  // Get existing hero IDs
  const existing = await query<{ id: string }>(
    `SELECT id FROM banners WHERE placement = 'hero' ORDER BY sort_order`
  );
  const existingIds = new Set(existing.map((r) => r.id));

  // Upsert each slide
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideId = slide.id;

    const payload = {
      imageUrl: slide.imageUrl ?? DEFAULT_HERO_CONTENT.slides[0].imageUrl,
      eyebrow: slide.eyebrow ?? DEFAULT_HERO_CONTENT.slides[0].eyebrow,
      titleLine1: slide.titleLine1 ?? DEFAULT_HERO_CONTENT.slides[0].titleLine1,
      titleLine2: slide.titleLine2 ?? DEFAULT_HERO_CONTENT.slides[0].titleLine2,
      subtitle: slide.subtitle ?? DEFAULT_HERO_CONTENT.slides[0].subtitle,
      ctaPrimaryLabel: slide.ctaPrimaryLabel ?? DEFAULT_HERO_CONTENT.slides[0].ctaPrimaryLabel,
      ctaPrimaryHref: slide.ctaPrimaryHref ?? DEFAULT_HERO_CONTENT.slides[0].ctaPrimaryHref,
      ctaSecondaryLabel: slide.ctaSecondaryLabel ?? DEFAULT_HERO_CONTENT.slides[0].ctaSecondaryLabel,
      ctaSecondaryHref: slide.ctaSecondaryHref ?? DEFAULT_HERO_CONTENT.slides[0].ctaSecondaryHref,
      sortOrder: slide.sortOrder ?? i,
      isActive: slide.isActive ?? true,
    };

    if (slideId && existingIds.has(slideId)) {
      // Update existing
      await query(
        `UPDATE banners
         SET image_url = $1, eyebrow = $2, title_line1 = $3, title_line2 = $4,
             subtitle = $5, cta_text = $6, cta_link = $7,
             cta_secondary_text = $8, cta_secondary_link = $9,
             sort_order = $10, is_active = $11, updated_at = NOW()
         WHERE id = $12`,
        [
          payload.imageUrl,
          payload.eyebrow,
          payload.titleLine1,
          payload.titleLine2,
          payload.subtitle,
          payload.ctaPrimaryLabel,
          payload.ctaPrimaryHref,
          payload.ctaSecondaryLabel,
          payload.ctaSecondaryHref,
          payload.sortOrder,
          payload.isActive,
          slideId,
        ]
      );
      existingIds.delete(slideId);
    } else {
      // Insert new
      await query(
        `INSERT INTO banners (placement, image_url, eyebrow, title_line1, title_line2, subtitle,
                              cta_text, cta_link, cta_secondary_text, cta_secondary_link,
                              sort_order, is_active)
         VALUES ('hero', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          payload.imageUrl,
          payload.eyebrow,
          payload.titleLine1,
          payload.titleLine2,
          payload.subtitle,
          payload.ctaPrimaryLabel,
          payload.ctaPrimaryHref,
          payload.ctaSecondaryLabel,
          payload.ctaSecondaryHref,
          payload.sortOrder,
          payload.isActive,
        ]
      );
    }
  }

  // Delete any hero rows that weren't in the new list
  if (existingIds.size > 0) {
    await query(
      `DELETE FROM banners WHERE placement = 'hero' AND id IN (${
        Array.from(existingIds).map((_, i) => `$${i + 1}`).join(',')
      })`,
      Array.from(existingIds)
    );
  }

  return readHeroContent();
}

/** Upsert the single promo banner. */
export async function updatePromoBanner(patch: Partial<HeroSlide>): Promise<void> {
  const existing = await query<{ id: string }>(
    `SELECT id FROM banners WHERE placement = 'promo' AND is_active = TRUE LIMIT 1`
  );

  const payload = {
    imageUrl: patch.imageUrl ?? '',
    eyebrow: patch.eyebrow ?? '',
    titleLine1: patch.titleLine1 ?? '',
    titleLine2: patch.titleLine2 ?? '',
    subtitle: patch.subtitle ?? '',
    ctaPrimaryLabel: patch.ctaPrimaryLabel ?? '',
    ctaPrimaryHref: patch.ctaPrimaryHref ?? '',
    ctaSecondaryLabel: patch.ctaSecondaryLabel ?? '',
    ctaSecondaryHref: patch.ctaSecondaryHref ?? '',
  };

  if (existing.length === 0) {
    await query(
      `INSERT INTO banners (placement, image_url, eyebrow, title_line1, title_line2, subtitle,
                            cta_text, cta_link, cta_secondary_text, cta_secondary_link, sort_order, is_active)
       VALUES ('promo', $1, $2, $3, $4, $5, $6, $7, $8, $9, 0, TRUE)`,
      [
        payload.imageUrl,
        payload.eyebrow,
        payload.titleLine1,
        payload.titleLine2,
        payload.subtitle,
        payload.ctaPrimaryLabel,
        payload.ctaPrimaryHref,
        payload.ctaSecondaryLabel,
        payload.ctaSecondaryHref,
      ]
    );
  } else {
    await query(
      `UPDATE banners
       SET image_url = $1, eyebrow = $2, title_line1 = $3, title_line2 = $4,
           subtitle = $5, cta_text = $6, cta_link = $7,
           cta_secondary_text = $8, cta_secondary_link = $9, updated_at = NOW()
       WHERE id = $10`,
      [
        payload.imageUrl,
        payload.eyebrow,
        payload.titleLine1,
        payload.titleLine2,
        payload.subtitle,
        payload.ctaPrimaryLabel,
        payload.ctaPrimaryHref,
        payload.ctaSecondaryLabel,
        payload.ctaSecondaryHref,
        existing[0].id,
      ]
    );
  }
}