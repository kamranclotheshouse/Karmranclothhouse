/**
 * Homepage hero carousel — multiple slides.
 * Each slide lives in `banners` table (placement = 'hero'), ordered by sort_order.
 * Read through `@/lib/db/banners`.
 */

export interface HeroSlide {
  id: string;
  imageUrl: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HeroContent {
  slides: HeroSlide[];
}

/** Default slides — used as fallback when no slides in DB. */
export const DEFAULT_HERO_CONTENT: HeroContent = {
  slides: [
    {
      id: 'default',
      imageUrl: '/images/hero.jpg',
      eyebrow: 'Shafi Market · Saddar · Peshawar',
      titleLine1: "Peshawar's",
      titleLine2: 'Finest Fabric',
      subtitle:
        "Unstitched luxury men's fabrics from Grace, Pasha, Gul Ahmed & 30+ top brands. Winter Karandi, Dulha designs, and Pashmina shawls delivered across Pakistan.",
      ctaPrimaryLabel: 'Contact on WhatsApp',
      ctaPrimaryHref: 'https://wa.me/923334764131',
      ctaSecondaryLabel: 'Dulha Design',
      ctaSecondaryHref: '/categories/dulha-design',
      sortOrder: 0,
      isActive: true,
    },
    {
      id: 'winter',
      imageUrl: '/images/winter-fabric.jpg',
      eyebrow: 'Winter Collection 2026',
      titleLine1: 'Winter',
      titleLine2: 'Warmth, Woven Right',
      subtitle:
        'Karandi, khaddar and wool shawls for Peshawar winters — browse the full winter collection, delivered Cash on Delivery across Pakistan.',
      ctaPrimaryLabel: 'Shop Winter Collection',
      ctaPrimaryHref: '/categories/winter-fabric',
      ctaSecondaryLabel: '',
      ctaSecondaryHref: '',
      sortOrder: 1,
      isActive: true,
    },
  ],
};

export function heroSlideToContent(slide: HeroSlide): Omit<HeroSlide, 'id' | 'sortOrder' | 'isActive'> {
  const { id, sortOrder, isActive, ...content } = slide;
  return content;
}