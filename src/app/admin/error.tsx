'use client';

/**
 * Catches anything the admin pages throw — in practice a failed database
 * connection — and turns it into a plain-language message instead of a
 * stack trace. Returning 500 here (rather than a friendly 200) is deliberate:
 * a broken backend should be visible to monitoring and to the browser.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Next.js marks its own control-flow errors (notFound, redirect) with a
  // `NEXT_` digest. They belong to the framework — rethrow so /admin gets a
  // real 404/redirect instead of this fallback with a 200.
  const digest = error?.digest ?? '';
  if (digest.startsWith('NEXT_')) {
    throw error;
  }

  return (
    <>
      <h1 className="admin-heading">Kuch theek nahi chal raha</h1>
      <div className="admin-error" role="alert">
        Database se baat nahi ho pai. Aapka kaam <strong>save nahi hua</strong> — kuch bhi
        badla nahi hai.
      </div>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Aage kya karein</h2>
        </div>
        <div className="admin-panel-body">
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.9 }}>
            <li>Internet connection check karein.</li>
            <li>Neeche wala button dabayein — ek aur baar try ho jayega.</li>
            <li>Agar baar baar ho raha hai to thodi der baad wapas aayein.</li>
          </ol>

          <div className="admin-actions">
            <button type="button" className="admin-btn" onClick={reset}>
              Dobara try karein
            </button>
          </div>
        </div>
      </section>

      {process.env.NODE_ENV !== 'production' && error?.message && (
        <p className="admin-hint" style={{ marginTop: 14 }}>
          Technical detail: <code>{error.message}</code>
        </p>
      )}
    </>
  );
}
