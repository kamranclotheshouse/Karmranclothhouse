'use client';

import { useEffect, useRef, useState } from 'react';

/** Shows one consistent busy state for every admin API action. */
export function AdminBusyIndicator() {
  const [busy, setBusy] = useState(false);
  const activeRequests = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const trackedFetch: typeof window.fetch = async (...args) => {
      activeRequests.current += 1;
      if (!showTimer.current) {
        showTimer.current = setTimeout(() => {
          showTimer.current = null;
          if (activeRequests.current > 0) setBusy(true);
        }, 180);
      }

      try {
        return await originalFetch(...args);
      } finally {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        if (activeRequests.current === 0) {
          if (showTimer.current) {
            clearTimeout(showTimer.current);
            showTimer.current = null;
          }
          setBusy(false);
        }
      }
    };

    window.fetch = trackedFetch;
    return () => {
      window.fetch = originalFetch;
      if (showTimer.current) clearTimeout(showTimer.current);
    };
  }, []);

  if (!busy) return null;

  return (
    <div className="admin-busy-overlay" role="status" aria-live="polite" aria-label="Processing request">
      <div className="admin-busy-card">
        <span className="admin-busy-spinner" aria-hidden="true" />
        <span>Processing… Please wait</span>
      </div>
    </div>
  );
}
