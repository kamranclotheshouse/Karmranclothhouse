import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminLoginForm } from '@/components/admin/LoginForm';
import { AdminToast } from '@/components/admin/ui';
import { COOKIE_NAME, verifySessionToken } from '@/lib/session';
import '@/styles/admin.css';

/**
 * Server component on purpose.
 *
 * Doing the session check here (rather than in a client `useEffect`) means the
 * admin pages actually render on the server: real content in the HTML, no
 * "Checking access…" flash, and — crucially — a `notFound()` or a database
 * failure can still set a 404/500 status, because the response has not been
 * flushed by the time the page runs.
 */
export const dynamic = 'force-dynamic';

/** Never let the admin panel into search results. */
export const metadata: Metadata = {
  title: 'Admin | Kamran Cloth House',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authenticated = verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);

  if (!authenticated) {
    return <AdminLoginForm />;
  }

  return (
    <div className="admin-wrapper">
      <AdminNav />
      <main className="admin-content">{children}</main>
      <AdminToast />
    </div>
  );
}



