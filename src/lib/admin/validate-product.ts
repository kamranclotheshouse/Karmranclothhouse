/**
 * Product validation — imported by BOTH the admin form and the API route, so
 * the message a customer-facing field shows is exactly the message the server
 * would have produced. No drift, no surprise on save.
 *
 * Errors are written for someone who does not read code: always say what to
 * do, and show a worked example.
 */

export interface ProductFormValues {
  title: string;
  slug: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  brandSlug: string;
  categorySlug: string;
  description: string;
  fabricType: string;
  length: string;
  width: string;
  season: string;
  weaveType: string;
  badge: string;
  sku: string;
  imageAlt: string;
}

export type ProductErrors = Partial<Record<keyof ProductFormValues | 'form', string>>;

const numbersOnly = /^\d+(\.\d{1,2})?$/;

/** Empty, or a whole/decimal number with at most two decimal places. */
function isPrice(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === '' || numbersOnly.test(trimmed);
}

export function validateProduct(values: ProductFormValues): ProductErrors {
  const errors: ProductErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Product ka naam likhein, jaise "Royal Karandi Charcoal".';
  } else if (values.title.trim().length > 255) {
    errors.title = `Naam bohat lamba hai (${values.title.length} harf). 255 se chhota rakhein.`;
  }

  if (!values.slug.trim()) {
    errors.slug = 'Address chahiye. "Royal Karandi" likhenge to aap ke liye "royal-karandi" ban jayega.';
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(values.slug.trim())) {
    errors.slug =
      'Sirf chhote harf, numbers aur dashes use karein — jaise "royal-karandi-charcoal". Spaces aur special symbols nahi.';
  }

  if (!values.price.trim()) {
    errors.price =
      'Daam likhein, jaise 4500. Agar daam baad me maloom hoga to "Price on inquiry" wala tick lagayein.';
  } else if (!numbersOnly.test(values.price.trim())) {
    errors.price = 'Sirf numbers likhein, jaise 4500 — "Rs." ya commas nahi.';
  }

  if (values.compareAtPrice.trim() && !isPrice(values.compareAtPrice)) {
    errors.compareAtPrice = 'Sirf numbers likhein, jaise 5200. Khali chhodna bhi theek hai.';
  }

  if (values.stockQuantity.trim() && !/^\d+$/.test(values.stockQuantity.trim())) {
    errors.stockQuantity = 'Sirf poore numbers likhein, jaise 50.';
  }

  if (values.description.trim().length > 4000) {
    errors.description = `Tafseel bohat lambi hai (${values.description.length} harf). 4000 se chhota rakhein.`;
  }

  if (values.badge.trim().length > 60) {
    errors.badge = 'Badge 60 harf se chhota rakhein — "New Arrival", "Bestseller", "Sale".';
  }

  return errors;
}

/** Map the API's field keys onto the input names the form uses. */
export const PRODUCT_ERROR_FIELDS = [
  'title',
  'slug',
  'price',
  'compareAtPrice',
  'stockQuantity',
  'description',
  'badge',
  'form',
] as const;

export function hasErrors(errors: ProductErrors): boolean {
  return Object.keys(errors).length > 0;
}
