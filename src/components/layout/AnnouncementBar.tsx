import type { StoreSettings } from '@/lib/settings';

/**
 * Thin strip above the header. Reads the announcement straight from the row the
 * root layout already fetched — no client hook, no localStorage.
 */
export default function AnnouncementBar({ settings }: { settings: StoreSettings }) {
  const text = settings.announcementText.trim();

  if (!settings.announcementEnabled || !text) return null;

  return (
    <div
      style={{ backgroundColor: 'var(--color-bg-dark)', color: 'var(--color-accent)' }}
      className="text-center py-2.5 text-xs tracking-widest uppercase"
    >
      {text}
    </div>
  );
}
