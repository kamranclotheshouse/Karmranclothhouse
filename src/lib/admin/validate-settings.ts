/**
 * Validation for the Settings form — runs in the browser (so the customer
 * admin sees the message as they type) and again in `/api/admin/settings`.
 *
 * Hinglish, concrete, with an example value where it helps.
 */

export interface SettingsFormValues {
  storeName: string;
  logoUrl: string;
  address: string;
  mapUrl: string;
  phone: string;
  landline: string;
  whatsappNumber: string;
  email: string;
  storeHours: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  deliveryCharge: string;
  freeDeliveryThreshold: string;
  announcementEnabled: boolean;
  announcementText: string;
  metaPixelId: string;
  tiktokPixelId: string;
}

export type SettingsErrors = Partial<Record<keyof SettingsFormValues, string>>;

export function hasSettingsErrors(errors: SettingsErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Accepts an empty link, or a full `https://…` URL. */
function checkUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Digits with optional `+`, spaces and dashes — how people actually type it. */
function checkPhone(value: string): boolean {
  if (!value) return true;
  return /^\+?[\d\s-]{7,20}$/.test(value);
}

function money(value: string): number | null {
  if (value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateSettings(values: SettingsFormValues): SettingsErrors {
  const errors: SettingsErrors = {};

  if (!values.storeName.trim()) {
    errors.storeName = 'Dukan ka naam zaroori hai — website header aur invoices pe dikhta hai.';
  } else if (values.storeName.trim().length > 150) {
    errors.storeName = 'Naam 150 character se chhota rakhein.';
  }

  if (!values.address.trim()) {
    errors.address = 'Poori address likhein — delivery aur contact page pe yahi jata hai.';
  }

  if (!checkPhone(values.whatsappNumber)) {
    errors.whatsappNumber = 'Sirf numbers, spaces aur + lagayein, jaise 923001234567.';
  }

  if (!checkPhone(values.phone)) {
    errors.phone = 'Sirf numbers, spaces aur + lagayein, jaise +92 300 000 0000.';
  }

  if (!checkPhone(values.landline)) {
    errors.landline = 'Sirf numbers, spaces aur + lagayein, jaise +92 91 5270000.';
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Email ka format theek nahi — jaise info@kamrancloth.pk';
  }

  for (const [key, label] of [
    ['logoUrl', 'Logo image'],
    ['mapUrl', 'Google Maps link'],
    ['instagramUrl', 'Instagram link'],
    ['facebookUrl', 'Facebook link'],
    ['tiktokUrl', 'TikTok link'],
  ] as const) {
    if (!checkUrl(values[key])) {
      errors[key] = `${label} poora link ho — "https://…" se shuru hona chahiye.`;
    }
  }

  const charge = money(values.deliveryCharge);
  if (charge === null) {
    errors.deliveryCharge = 'Delivery charge number hona chahiye, jaise 250.';
  } else if (charge < 0) {
    errors.deliveryCharge = 'Delivery charge minus nahi ho sakta — 0 ya zyada likhein.';
  }

  const threshold = money(values.freeDeliveryThreshold);
  if (threshold === null) {
    errors.freeDeliveryThreshold = 'Free delivery limit number honi chahiye, jaise 15000.';
  } else if (threshold < 0) {
    errors.freeDeliveryThreshold = 'Free delivery limit minus nahi ho sakta — 0 ya zyada likhein.';
  }

  if (values.announcementEnabled && !values.announcementText.trim()) {
    errors.announcementText =
      'Announcement band kar dein ya uska text likhein — khali strip dikhne se accha hai chhupana.';
  }

  return errors;
}
