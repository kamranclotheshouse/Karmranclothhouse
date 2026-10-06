'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Shows one consistent busy state for every admin API action. */
export function AdminBusyIndicator() {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const activeRequests = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (!navigating) return undefined;
    const timeout = window.setTimeout(() => setNavigating(false), 15000);
    const clear = () => setNavigating(false);
    window.addEventListener('popstate', clear);
    window.addEventListener('pageshow', clear);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('popstate', clear);
      window.removeEventListener('pageshow', clear);
    };
  }, [navigating]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (url.pathname.startsWith('/admin')) setNavigating(true);
    };
    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const trackedFetch: typeof window.fetch = async (...args) => {
      const requestInput = args[0];
      const requestUrl = typeof requestInput === 'string'
        ? requestInput
        : requestInput instanceof URL
          ? requestInput.pathname
          : requestInput instanceof Request
            ? requestInput.url
            : '';
      const isAdminApiAction = new URL(requestUrl || window.location.href, window.location.href).pathname.startsWith('/api/');
      if (!isAdminApiAction) return originalFetch(...args);

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

  if (!busy && !navigating) return null;

  return (
    <div className="admin-busy-overlay" role="status" aria-live="polite" aria-label="Processing request">
      <div className="admin-busy-card">
        <span className="admin-busy-spinner" aria-hidden="true" />
        <span>{navigating ? 'Loading page… Please wait' : 'Processing… Please wait'}</span>
      </div>
    </div>
  );
}
