/**
 * Store settings — the single row `store_settings` (id = 1): name, contact
 * details, delivery pricing, announcement bar and social links.
 *
 * Server-only: never import from a "use client" file. Client components read
 * these values through `useStoreSettings()` (see `@/components/store/StoreProvider`),
 * which the root layout feeds from `getStoreSettings()`.
 */
import { cache } from 'react';
import { query } from './driver';
import { DEFAULT_SETTINGS, type StoreSettings } from '../settings';

export { DEFAULT_SETTINGS, getDeliveryFee, type StoreSettings } from '../settings';

/* ── Row shape (snake_case, straight off the wire) ────────────────────────── */

interface SettingsRow {
  store_name: string;
  logo_url: string | null;
  address: string | null;
  map_url: string | null;
  phone: string | null;
  landline: string | null;
  whatsapp_number: string | null;
  email: string | null;
  store_hours: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  delivery_charge: string | number;
  free_delivery_threshold: string | number;
  announcement_enabled: boolean;
  announcement_text: string | null;
  meta_pixel_id: string | null;
  tiktok_pixel_id: string | null;
}

/** camelCase view handed to components — re-exported from `@/lib/settings`. */

const NUMERIC = new Set(['deliveryCharge', 'freeDeliveryThreshold'] as const);
const BOOLEAN = new Set(['announcementEnabled'] as const);

const str = (value: string | null | undefined, fallback: string): string =>
  value === null || value === undefined ? fallback : value;

/* ── Reads ────────────────────────────────────────────────────────────────── */

const SELECT = `
  SELECT store_name, logo_url, address, map_url, phone, landline,
         whatsapp_number, email, store_hours, instagram_url, facebook_url,
         tiktok_url, delivery_charge, free_delivery_threshold,
         announcement_enabled, announcement_text, meta_pixel_id, tiktok_pixel_id
  FROM store_settings
  WHERE id = 1
`;

/**
 * The single settings row, read uncached. Missing rows and blank columns fall
 * back to `DEFAULT_SETTINGS`, so a half-seeded database can never render
 * `undefined`.
 *
 * Exported consumers go through `getStoreSettings`, which is wrapped in React
 * `cache` because a render usually wants the row twice — the root layout
 * (footer, announcement, WhatsApp button) and the page itself.
 */
async function readSettings(): Promise<StoreSettings> {
  const rows = await query<SettingsRow>(SELECT);
  const row = rows[0];
  if (!row) return { ...DEFAULT_SETTINGS };

  return {
    storeName: str(row.store_name, DEFAULT_SETTINGS.storeName),
    logoUrl: str(row.logo_url, ''),
    address: str(row.address, DEFAULT_SETTINGS.address),
    mapUrl: str(row.map_url, ''),
    phone: str(row.phone, DEFAULT_SETTINGS.phone),
    landline: str(row.landline, DEFAULT_SETTINGS.landline),
    whatsappNumber: str(row.whatsapp_number, DEFAULT_SETTINGS.whatsappNumber),
    email: str(row.email, DEFAULT_SETTINGS.email),
    storeHours: str(row.store_hours, DEFAULT_SETTINGS.storeHours),
    instagramUrl: str(row.instagram_url, ''),
    facebookUrl: str(row.facebook_url, ''),
    tiktokUrl: str(row.tiktok_url, ''),
    deliveryCharge: Number(row.delivery_charge) || 0,
    freeDeliveryThreshold: Number(row.free_delivery_threshold) || 0,
    announcementEnabled: Boolean(row.announcement_enabled),
    announcementText: str(row.announcement_text, ''),
    metaPixelId: str(row.meta_pixel_id, ''),
    tiktokPixelId: str(row.tiktok_pixel_id, ''),
  };
}

export const getStoreSettings = cache(readSettings);

/** What the admin form is edited against — defaults merged over the row. */
export async function getAdminSettings(): Promise<StoreSettings> {
  const settings = await readSettings();
  return { ...DEFAULT_SETTINGS, ...settings };
}

/* ── Writes ───────────────────────────────────────────────────────────────── */

const COLUMNS: Record<string, string> = {
  storeName: 'store_name',
  logoUrl: 'logo_url',
  address: 'address',
  mapUrl: 'map_url',
  phone: 'phone',
  landline: 'landline',
  whatsappNumber: 'whatsapp_number',
  email: 'email',
  storeHours: 'store_hours',
  instagramUrl: 'instagram_url',
  facebookUrl: 'facebook_url',
  tiktokUrl: 'tiktok_url',
  deliveryCharge: 'delivery_charge',
  freeDeliveryThreshold: 'free_delivery_threshold',
  announcementEnabled: 'announcement_enabled',
  announcementText: 'announcement_text',
  metaPixelId: 'meta_pixel_id',
  tiktokPixelId: 'tiktok_pixel_id',
};

/**
 * Persist the settings row. Accepts a partial patch — anything omitted keeps
 * its current value — and rejects unknown keys so a typo cannot silently do
 * nothing.
 */
export async function updateStoreSettings(
  patch: Partial<StoreSettings>
): Promise<StoreSettings> {
  const entries = Object.entries(patch).filter(([key]) => key in COLUMNS);
  if (entries.length > 0) {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const [key, raw] of entries) {
      const column = COLUMNS[key];
      params.push(raw);
      const index = params.length;

      if (NUMERIC.has(key as never)) {
        sets.push(`${column} = $${index}::numeric`);
      } else if (BOOLEAN.has(key as never)) {
        sets.push(`${column} = $${index}::boolean`);
      } else {
        sets.push(`${column} = $${index}::text`);
      }
    }

    // The id is the last parameter — its placeholder must not collide with the
    // `$1` used by the first SET column.
    await query(`UPDATE store_settings SET ${sets.join(', ')} WHERE id = $${params.length + 1}`, [
      ...params,
      1,
    ]);
  }

  // Read fresh, not through the request-scoped cache — this row was just written.
  return readSettings();
}

