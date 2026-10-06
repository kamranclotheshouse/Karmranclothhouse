'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notify } from '@/components/admin/ui';
import type { AdminProduct } from '@/lib/db/catalogue';

type Filter = 'all' | 'in' | 'out' | 'featured';

export function ProductList({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === 'in' && !p.isInStock) return false;
      if (filter === 'out' && p.isInStock) return false;
      if (filter === 'featured' && !p.isFeatured) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.slug.includes(needle)
      );
    });
  }, [products, filter, search]);

  const inStockCount = products.filter((p) => p.isInStock).length;

  async function toggleStock(product: AdminProduct) {
    const next = !product.isInStock;
    setBusy(product.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isInStock: next }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ ok: false }));
        setError(body.error || 'Stock update nahi ho paya. Dobara try karein.');
        return;
      }
      notify(next ? 'In stock mark ho gaya' : 'Out of stock mark ho gaya');
      router.refresh();
    } catch {
      setError('Server se connection nahi ho paya.');
    } finally {
      setBusy(null);
    }
  }

  async function setAllStock(next: boolean) {
    const targets = products.filter((p) => p.isInStock !== next);
    if (targets.length === 0) return;
    if (
      !window.confirm(
        `${targets.length} products ${next ? 'in stock' : 'out of stock'} mark karne hain. Theek hai?`
      )
    ) {
      return;
    }

    setBusy('all');
    setError(null);
    try {
      const results = await Promise.all(
        targets.map((p) =>
          fetch(`/api/admin/products/${p.id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ isInStock: next }),
          }).then((r) => r.ok)
        )
      );
      const failed = results.filter((ok) => !ok).length;
      if (failed > 0) {
        setError(`${failed} products update nahi hue. Page refresh karke dobara dekhein.`);
        return;
      }
      notify(`${targets.length} products updated`);
      router.refresh();
    } catch {
      setError('Server se connection nahi ho paya.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="admin-list-toolbar">
        <div className="admin-list-filters">
          {(
            [
              ['all', 'All'],
              ['in', 'In Stock'],
              ['out', 'Out of Stock'],
              ['featured', 'Featured'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              style={filter === key ? { backgroundColor: '#030302', color: '#ffffff' } : undefined}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-list-search">
          <input
            type="search"
            className="admin-input"
            placeholder="Naam, brand ya category se dhoondein…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="admin-list-actions">
        <span className="admin-list-count">
          {rows.length === products.length
            ? `${products.length} products`
            : `${rows.length} of ${products.length} products`}
          {' · '}
          {inStockCount} in stock
        </span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            disabled={busy !== null}
            onClick={() => setAllStock(true)}
          >
            Mark all as in stock
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={busy !== null}
            onClick={() => setAllStock(false)}
          >
            Mark all as out of stock
          </button>
        </span>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-panel">
        {rows.length === 0 ? (
          <p className="admin-empty">
            {products.length === 0
              ? 'Abhi koi product nahi. Upar "Add Product" se pehla product banayein.'
              : 'Is filter se koi product nahi mila.'}
          </p>
        ) : (
          rows.map((product) => {
            const activeColors = product.colors.filter((c) => c.inStock).length;
            const isBusy = busy === product.id || busy === 'all';
            return (
              <div className="admin-product" key={product.id}>
                <div className="admin-product-thumb-wrap">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt=""
                      className="admin-product-thumb"
                    />
                  ) : (
                    <span className="admin-product-thumb-empty">—</span>
                  )}
                </div>

                <div className="admin-product-info">
                  <p className="admin-product-name">{product.name}</p>
                  <p className="admin-product-meta">
                    {product.brand || 'No brand'} · {product.category || 'No category'} ·{' '}
                    {activeColors}/{product.colors.length} colours
                    {product.isFeatured ? ' · Featured' : ''}
                  </p>
                </div>

                <span className="admin-product-price">
                  Rs. {product.price.toLocaleString('en-PK')}
                </span>

                <span className="admin-badge" data-status={product.isInStock ? 'delivered' : 'cancelled'}>
                  {product.isInStock ? 'In Stock' : 'Out of Stock'}
                </span>

                <span className="admin-product-buttons">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    disabled={isBusy}
                    onClick={() => toggleStock(product)}
                  >
                    {product.isInStock ? 'Mark out' : 'Mark in'}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                  >
                    Edit
                  </button>
                </span>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}
