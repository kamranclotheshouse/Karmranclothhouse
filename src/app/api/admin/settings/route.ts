import { NextResponse } from 'next/server';
import { getAdminSettings, updateStoreSettings } from '@/lib/db/settings';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';
import {
  hasSettingsErrors,
  validateSettings,
  type SettingsFormValues,
} from '@/lib/admin/validate-settings';

export const dynamic = 'force-dynamic';

/** Booleans and numbers arrive as strings from a form; blanks become ''. */
function readValues(body: Record<string, unknown>): SettingsFormValues {
  const text = (key: string): string => {
    const value = body[key];
    return typeof value === 'string' ? value : value == null ? '' : String(value);
  };

  return {
    storeName: text('storeName'),
    logoUrl: text('logoUrl'),
    address: text('address'),
    mapUrl: text('mapUrl'),
    phone: text('phone'),
    landline: text('landline'),
    whatsappNumber: text('whatsappNumber'),
    email: text('email'),
    storeHours: text('storeHours'),
    instagramUrl: text('instagramUrl'),
    facebookUrl: text('facebookUrl'),
    tiktokUrl: text('tiktokUrl'),
    deliveryCharge: text('deliveryCharge'),
    freeDeliveryThreshold: text('freeDeliveryThreshold'),
    announcementEnabled: body.announcementEnabled !== false,
    announcementText: text('announcementText'),
    metaPixelId: text('metaPixelId'),
    tiktokPixelId: text('tiktokPixelId'),
  };
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    return ok({ settings: await getAdminSettings() });
  } catch (error) {
    console.error('GET /api/admin/settings failed:', error);
    return fail('Settings could not be loaded. Check the database connection.', 500);
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  const values = readValues(body);
  const errors = validateSettings(values);
  if (hasSettingsErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const settings = await updateStoreSettings({
      storeName: values.storeName.trim(),
      logoUrl: values.logoUrl.trim(),
      address: values.address.trim(),
      mapUrl: values.mapUrl.trim(),
      phone: values.phone.trim(),
      landline: values.landline.trim(),
      whatsappNumber: values.whatsappNumber.replace(/[^\d]/g, ''),
      email: values.email.trim(),
      storeHours: values.storeHours.trim(),
      instagramUrl: values.instagramUrl.trim(),
      facebookUrl: values.facebookUrl.trim(),
      tiktokUrl: values.tiktokUrl.trim(),
      deliveryCharge: Number(values.deliveryCharge) || 0,
      freeDeliveryThreshold: Number(values.freeDeliveryThreshold) || 0,
      announcementEnabled: values.announcementEnabled,
      announcementText: values.announcementText.trim(),
      metaPixelId: values.metaPixelId.trim(),
      tiktokPixelId: values.tiktokPixelId.trim(),
    });

    // Footer, announcement bar and WhatsApp button live in the root layout —
    // one pass revalidates them everywhere they appear.
    revalidateCatalogue();
    return ok({ settings });
  } catch (error) {
    console.error('PUT /api/admin/settings failed:', error);
    return fail('The settings could not be saved. Nothing was changed — try again.', 500);
  }
}
