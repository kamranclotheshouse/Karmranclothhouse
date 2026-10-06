/**
 * Validation for a single hero slide — runs in the browser (so the admin
 * sees the message as they type) and again in `/api/admin/home`.
 *
 * Hinglish, concrete, with an example value where it helps.
 */

export interface HeroSlideFormValues {
  imageUrl: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export type HeroSlideErrors = Partial<Record<keyof HeroSlideFormValues, string>>;

export type HeroFormValues = HeroSlideFormValues;
export type HeroErrors = HeroSlideErrors;

export function hasHeroErrors(errors: HeroSlideErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Internal links start with `/`; external ones must be a full http(s) URL. */
function checkLink(value: string, example: string): boolean {
  if (!value) return false;
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    void example;
    return false;
  }
}

function checkImage(value: string): boolean {
  if (!value) return true;
  if (value.startsWith('/')) return true;
  return /^https:\/\/.+/.test(value);
}

const tooLong = (value: string, max: number): boolean => value.length > max;

export function validateHero(values: HeroSlideFormValues): HeroSlideErrors {
  const errors: HeroSlideErrors = {};

  if (!values.eyebrow.trim()) {
    errors.eyebrow = 'Chhota line upar dikhta hai — jaise "Shafi Market · Saddar · Peshawar".';
  } else if (tooLong(values.eyebrow, 120)) {
    errors.eyebrow = '120 character se chhota rakhein — warna mobile pe kat jayega.';
  }

  if (!values.titleLine1.trim()) {
    errors.titleLine1 = 'Heading ka pehla line zaroori hai — jaise "Peshawar\'s".';
  } else if (tooLong(values.titleLine1, 120)) {
    errors.titleLine1 = '120 character se chhota rakhein.';
  }

  if (tooLong(values.titleLine2, 120)) {
    errors.titleLine2 = '120 character se chhota rakhein.';
  }

  if (!values.subtitle.trim()) {
    errors.subtitle = 'Ek chhoti description likhein — 1–2 lines, brands ka zikr karein.';
  } else if (tooLong(values.subtitle, 400)) {
    errors.subtitle = '400 character se chhota rakhein — warna hero bohot lamba ho jayega.';
  }

  if (!values.ctaPrimaryLabel.trim()) {
    errors.ctaPrimaryLabel = 'Pehle button ka label chahiye, jaise "Winter Collection".';
  }

  if (!checkLink(values.ctaPrimaryHref, '/categories/winter-fabric')) {
    errors.ctaPrimaryHref = 'Link `/` se shuru ho ya poora https:// ho, jaise /categories/winter-fabric.';
  }

  if (values.ctaSecondaryLabel.trim() && !checkLink(values.ctaSecondaryHref, '/categories/dulha-design')) {
    errors.ctaSecondaryHref = 'Link `/` se shuru ho ya poora https:// ho, jaise /categories/dulha-design.';
  }

  if (values.ctaSecondaryHref.trim() && !values.ctaSecondaryLabel.trim()) {
    errors.ctaSecondaryLabel = 'Doosre button ka label bhi likhein, ya dono khali chhodein.';
  }

  if (!checkImage(values.imageUrl)) {
    errors.imageUrl = 'Image `/images/hero.jpg` jaisa local path ho ya https:// link ho.';
  }

  return errors;
}