import { getAdminSettings } from '@/lib/db/settings';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

/**
 * Server component: the row is read straight from the database so the form
 * always opens on what customers are currently seeing. Saving goes through
 * `PUT /api/admin/settings`, which revalidates the storefront.
 */
export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return <SettingsForm settings={settings} />;
}
