export default function Loading() {
  return (
    <main
      className="site-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="site-loading__spinner" aria-hidden="true" />
      <p>Loading…</p>
    </main>
  );
}
