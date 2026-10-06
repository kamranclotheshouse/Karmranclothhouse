'use client';

import Link from 'next/link';

/**
 * Storefront error boundary. Shown when a server component throws — most often
 * a database connection that did not come up in time.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 32,
        textAlign: 'center',
        fontFamily: 'var(--font-outfit), Outfit, sans-serif',
        background: '#ffffff',
        color: '#030302',
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-accent-text, #7a5f0e)',
          margin: 0,
        }}
      >
        Kamran Cloth House
      </p>

      <h1 style={{ fontFamily: 'var(--font-playfair), "Playfair Display", serif', fontSize: 26, margin: 0 }}>
        Ek masla aa gaya
      </h1>

      <p style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.7, margin: 0, color: '#52525b' }}>
        Page load nahi ho saka. Aapka order ya browsing data safe hai — sirf ek baar dobara
        try karein.
      </p>

      <button
        type="button"
        onClick={reset}
        style={{
          padding: '13px 30px',
          background: '#030302',
          color: '#ffffff',
          border: 'none',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Dobara try karein
      </button>

      <Link
        href="/"
        style={{ fontSize: 12, color: '#52525b', textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        Home pe wapas jayein
      </Link>

      {process.env.NODE_ENV !== 'production' && error?.message && (
        <p style={{ fontSize: 11, color: '#a1a1aa', margin: 0 }}>
          Technical detail: <code>{error.message}</code>
        </p>
      )}
    </main>
  );
}