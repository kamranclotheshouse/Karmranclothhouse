/**
 * Store settings — shape and defaults.
 *
 * Deliberately free of server imports (no `./db/driver`) so it can be pulled
 * into any "use client" file. The database lives in `@/lib/db/settings`.
 */

/** camelCase view handed to components. Every field has a usable default. */
export interface StoreSettings {
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
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  announcementEnabled: boolean;
  announcementText: string;
  metaPixelId: string;
  tiktokPixelId: string;
}

/**
 * Mirrors `STORE` in `@/lib/data` exactly, so a page that has not been switched
 * over yet still shows the placeholder the client expects. Used for the initial
 * render before the layout has read the row, and as the fallback when a column
 * is blank.
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Kamran Cloth House',
  logoUrl: '',
  address:
    'Shop # 14-16, Ground Floor, Shafi Market, Saddar Road, Peshawar, KP, Pakistan',
  mapUrl: '',
  phone: '+92 300 000 0000',
  landline: '+92 91 5270000',
  whatsappNumber: '923000000000',
  email: 'info@kamrancloth.pk',
  storeHours: 'Mon–Sat: 11am–9pm · Friday: 4pm–9pm',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  deliveryCharge: 250,
  freeDeliveryThreshold: 15000,
  announcementEnabled: true,
  announcementText:
    'Free delivery on orders above Rs 15,000 · Cash on Delivery across Pakistan',
  metaPixelId: '',
  tiktokPixelId: '',
};

/** Free above the threshold, otherwise the flat charge. */
export function getDeliveryFee(
  settings: Pick<StoreSettings, 'deliveryCharge' | 'freeDeliveryThreshold'>,
  subtotal: number
): number {
  return subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge;
}
