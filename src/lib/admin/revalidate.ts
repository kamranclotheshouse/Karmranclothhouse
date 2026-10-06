import { revalidatePath } from 'next/cache';

/**
 * The storefront reads the database, so a catalogue edit has to invalidate the
 * cached HTML that shows it — otherwise an admin change would take up to
 * `revalidate` seconds to appear.
 *
 * Called from the admin product routes (create, update, delete). Under the
 * root layout covers the home page, `/product/[slug]`, `/categories/*` and
 * `/brands/*` in one call. Route Handler invalidation is lazy: Next rebuilds
 * each page on its next visit rather than eagerly.
 */
export function revalidateCatalogue(): void {
  revalidatePath('/', 'layout');
}
