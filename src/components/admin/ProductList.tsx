'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notify } from '@/components/admin/ui';
import type { AdminProduct } from '@/lib/db/catalogue';

type Filter = 'all' | 'in' | 'out' | 'featured';

export function ProductList({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminProduct[]>(products);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(products);
  }, [products]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((p) => {
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
  }, [items, filter, search]);

  const inStockCount = items.filter((p) => p.isInStock).length;

  async function toggleStock(product: AdminProduct) {
    const next = !product.isInStock;
    setItems((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isInStock: next } : p))
    );
    setBusy(product.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isInStock: next }),
      });
      if (!response.ok) {
        setItems((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isInStock: !next } : p))
        );
        const body = await response.json().catch(() => ({ ok: false }));
        setError(body.error || 'Stock update nahi ho paya. Dobara try karein.');
        return;
      }
      notify(next ? 'In stock mark ho gaya' : 'Out of stock mark ho gaya');
      router.refresh();
    } catch {
      setItems((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isInStock: !next } : p))
      );
      setError('Server se connection nahi ho paya.');
    } finally {
      setBusy(null);
    }
  }

  async function removeProduct(product: AdminProduct) {
    setConfirmingId(null);
    setDeletingId(product.id);
    setBusy(product.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ ok: false }));
        setError(body.error || 'Product remove nahi ho paya. Dobara try karein.');
        return;
      }
      notify('Product delete ho gaya');
      // Remove from list only after successful delete
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      router.refresh();
    } catch {
      setError('Server se connection nahi ho paya.');
    } finally {
      setBusy(null);
      setDeletingId(null);
    }
  }

  async function setAllStock(next: boolean) {
    const targets = items.filter((p) => p.isInStock !== next);
    if (targets.length === 0) return;

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
      notify(`Sab products ${next ? 'in stock' : 'out of stock'} ho gaye`);
      router.refresh();
    } catch {
      setError('Server se connection nahi ho paya.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="admin-filter-bar">
        <input
          type="search"
          placeholder="Search products (naam, brand, category, slug)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />

        <div className="admin-pill-group" role="tablist" aria-label="Filter products">
          <button
            type="button"
            className={`admin-pill ${filter === 'all' ? 'admin-pill--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            className={`admin-pill ${filter === 'in' ? 'admin-pill--active' : ''}`}
            onClick={() => setFilter('in')}
          >
            In Stock ({inStockCount})
          </button>
          <button
            type="button"
            className={`admin-pill ${filter === 'out' ? 'admin-pill--active' : ''}`}
            onClick={() => setFilter('out')}
          >
            Out of Stock ({items.length - inStockCount})
          </button>
          <button
            type="button"
            className={`admin-pill ${filter === 'featured' ? 'admin-pill--active' : ''}`}
            onClick={() => setFilter('featured')}
          >
            Featured ({items.filter((p) => p.isFeatured).length})
          </button>
        </div>
      </div>

      <div className="admin-bulk-bar">
        <span className="admin-bulk-meta">
          Bulk stock actions for all {items.length} products:
        </span>
        <span className="admin-bulk-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={busy === 'all' || inStockCount === items.length}
            onClick={() => setAllStock(true)}
          >
            Mark all as in stock
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={busy === 'all' || inStockCount === 0}
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
            {items.length === 0
              ? 'Abhi koi product nahi. Upar "Add Product" se pehla product banayein.'
              : 'Is filter se koi product nahi mila.'}
          </p>
        ) : (
          rows.map((product) => {
            const activeColors = product.colors.filter((c) => c.inStock).length;
            const isBusy = busy === product.id || busy === 'all';
            const isDeleting = deletingId === product.id;
            return (
              <div
                className="admin-product"
                key={product.id}
                style={isDeleting ? { opacity: 0.4, pointerEvents: 'none', transition: 'opacity 0.3s' } : undefined}
              >
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
                    {product.isOnSale ? ' · On Sale' : ''}
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

                  {isDeleting ? (
                    <span style={{ fontSize: 12, color: '#B42318', fontWeight: 600 }}>Deleting…</span>
                  ) : confirmingId === product.id ? (
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        disabled={isBusy}
                        onClick={() => removeProduct(product)}
                      >
                        Confirm Delete?
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      style={{ color: '#B42318' }}
                      disabled={isBusy}
                      onClick={() => setConfirmingId(product.id)}
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}
