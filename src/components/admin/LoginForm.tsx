'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * The PIN form. Rendered by the admin layout when there is no valid session
 * cookie — the check itself happens on the server, so no user ever sees a
 * "checking access" flash and pages keep their real status codes.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPin('');
        router.refresh();
      } else {
        setError(data.error ?? 'Unable to sign in.');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <img
          src="/kamran_logo.png"
          alt="Kamran Cloth House"
          className="admin-login-logo"
        />
        <h1 className="admin-login-title">Admin Portal</h1>
        <p className="admin-login-sub">Kamran Cloth House — Saddar, Peshawar</p>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-pin">
            PIN
          </label>
          <input
            id="admin-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            className="admin-input"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn--gold admin-login-submit"
          disabled={submitting || pin.length === 0}
        >
          {submitting ? 'Verifying…' : 'Sign In'}
        </button>

        <p className="admin-hint">
          Set <code>ADMIN_PIN</code> in <code>.env.local</code> (default is{' '}
          <code>1990</code>). This gate protects the dashboard UI — real security comes
          from keeping the database credentials server-side only.
        </p>

        <Link href="/" className="admin-login-back">
          ← Back to store
        </Link>
      </form>
    </div>
  );
}
