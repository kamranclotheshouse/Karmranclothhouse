'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className="admin-link"
      style={{ width: '100%', opacity: busy ? 0.6 : 1 }}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/admin/auth', { method: 'DELETE' });
        setBusy(false);
        router.push('/admin');
        router.refresh();
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {busy ? 'Signing out…' : 'Sign Out'}
    </button>
  );
}
