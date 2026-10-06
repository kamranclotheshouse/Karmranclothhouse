'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Suggestion {
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);

  const trimmed = term.trim();
  const pending = trimmed.length >= 2 && answered !== trimmed;

  // Focus the field the moment the panel opens.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  // Esc closes it — same as clicking away.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Debounced lookup so we hit the API once the customer stops typing.
  // Short queries never reach the API — the panel hides itself below two
  // characters, so there is nothing to clear here.
  useEffect(() => {
    if (!open || trimmed.length < 2) return undefined;

    let cancelled = false;
    const id = window.setTimeout(async () => {
      let next: Suggestion[] = [];
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`);
        const data = (await res.json()) as { products?: Suggestion[] };
        next = data.products ?? [];
      } catch {
        next = [];
      }
      if (!cancelled) {
        setResults(next);
        setAnswered(trimmed);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [trimmed, open]);

  const go = () => {
    const q = term.trim();
    if (!q) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed left-0 right-0 top-0 z-50 bg-white shadow-xl"
        style={{ borderBottom: '1px solid var(--color-border)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className="flex items-center gap-3"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="flex-shrink-0"
              style={{ color: 'var(--color-fg-muted)' }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              ref={inputRef}
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search fabrics, brands, colours…"
              className="flex-1 text-lg md:text-xl py-2 bg-transparent outline-none placeholder:text-muted"
              style={{ fontFamily: "'Playfair Display', serif" }}
              autoComplete="off"
            />

            <button
              type="submit"
              className="px-5 py-2.5 text-xs tracking-[0.2em] uppercase bg-brand text-white hover:bg-brand-soft transition-colors font-semibold"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-cream rounded-full transition-colors"
              aria-label="Close search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </form>

          {/* Suggestions */}
          {term.trim().length >= 2 && (
            <div className="mt-4 border-t border-line pt-4">
              {pending && (
                <p className="text-xs tracking-widest uppercase py-2" style={{ color: 'var(--color-fg-muted)' }}>
                  Searching…
                </p>
              )}

              {!pending && results.length === 0 && (
                <p className="text-sm py-2" style={{ color: 'var(--color-fg-muted)' }}>
                  No fabric matched “{term.trim()}”. Try a brand name like{' '}
                  <span className="text-ink font-medium">Gul Ahmed</span>, or a colour like{' '}
                  <span className="text-ink font-medium">navy</span>.
                </p>
              )}

              {!pending && results.length > 0 && (
                <ul className="divide-y divide-line">
                  {results.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 py-3 hover:bg-cream transition-colors px-2 -mx-2"
                      >
                        <div className="relative w-12 h-14 flex-shrink-0 overflow-hidden bg-cream">
                          {item.image && (
                            <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] tracking-widest uppercase text-muted">{item.brand}</p>
                          <p
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-sm tracking-wide text-ink truncate"
                          >
                            {item.name}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-ink whitespace-nowrap">
                          Rs. {item.price.toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={go}
                className="mt-3 w-full py-3 text-xs tracking-[0.25em] uppercase border border-line hover:border-brand transition-colors font-semibold"
              >
                See all results for “{term.trim()}”
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}