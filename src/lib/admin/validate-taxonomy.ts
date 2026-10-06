/**
 * Rules for the category and brand forms.
 *
 * Plain `Record<string, string>` rather than a thrown error so the same
 * function can run in the browser (inline, on blur) and in the API route
 * (authoritatively, on submit) without two sources of truth.
 *
 * Every message says what to do, not just what is wrong.
 */

export type TaxonomyKind = 'category' | 'brand';

export interface TaxonomyFormValues {
  name: string;
  slug: string;
  /** Category → subtitle (the gold line). Brand → tagline. */
  sub: string;
  description: string;
  /** Category → cover image. Brand → logo URL. */
  image: string;
}

export type TaxonomyErrors = Record<string, string>;

const MAX = { name: 100, slug: 150, sub: 150, description: 600 };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateTaxonomy(
  values: TaxonomyFormValues,
  kind: TaxonomyKind
): TaxonomyErrors {
  const errors: TaxonomyErrors = {};
  const noun = kind === 'category' ? 'Category' : 'Brand';

  const name = values.name.trim();
  if (!name) {
    errors.name = `${noun} ka naam likhein, jaise ${kind === 'category' ? 'Winter Fabric' : 'Gul Ahmed'}.`;
  } else if (name.length > MAX.name) {
    errors.name = `Naam ${MAX.name} characters se chhota rakhein.`;
  }

  const slug = values.slug.trim();
  if (slug && !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Sirf chhote letters, numbers aur dashes — jaise "winter-fabric".';
  } else if (slug.length > MAX.slug) {
    errors.slug = `Address ${MAX.slug} characters se chhota rakhein.`;
  }

  if (values.sub.length > MAX.sub) {
    errors.sub = `${kind === 'category' ? 'Subtitle' : 'Tagline'} ${MAX.sub} characters se chhota rakhein.`;
  }

  if (values.description.length > MAX.description) {
    errors.description = `Tafseel ${MAX.description} characters se chhota rakhein.`;
  }

  const image = values.image.trim();
  if (image && !/^(https?:\/\/|\/)/.test(image)) {
    errors.image = 'Image address http, https ya / se shuru honi chahiye, jaise /images/winter.jpg ya https://res.cloudinary.com/…';
  }

  return errors;
}

export function hasTaxonomyErrors(errors: TaxonomyErrors): boolean {
  return Object.keys(errors).length > 0;
}
