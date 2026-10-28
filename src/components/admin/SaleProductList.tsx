'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notify } from '@/components/admin/ui';
import type { AdminProduct } from '@/lib/db/catalogue';

export function SaleProductList({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminProduct[]>(products);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [confirmingSaleId, setConfirmingSaleId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(products);
  }, [products]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const p of items) {
      if (p.brand) set.add(p.brand);
    }
    return Array.from(set).sort();
  }, [items]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((p) => {
      if (stockFilter === 'in' && !p.isInStock) return false;
      if (stockFilter === 'out' && p.isInStock) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.slug.includes(needle)
      );
    });
  }, [items, search, brandFilter, stockFilter]);

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
        setError(body.error || 'Stock update nahi ho paya.');
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

  async function executeRemoveFromSale(product: AdminProduct) {
    setConfirmingSaleId(null);
    setRemovingId(product.id);
    setBusy(product.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isOnSale: false, badge: null }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ ok: false }));
        setError(body.error || 'Sale se hataya nahi ja saka.');
        return;
      }
      notify('Product sale se hata diya gaya');
      // Remove from list only after API confirms success
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      router.refresh();
    } catch {
      setError('Server se connection nahi ho paya.');
    } finally {
      setBusy(null);
      setRemovingId(null);
    }
  }

  return (
    <>
      <div className="admin-filter-bar">
        <input
          type="search"
          placeholder="Sale products search karein (naam, brand, category)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
          style={{ maxWidth: 360 }}
        />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {availableBrands.length > 0 && (
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="admin-select"
              style={{ width: 'auto', minWidth: 150 }}
            >
              <option value="">Sab Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in' | 'out')}
            className="admin-select"
            style={{ width: 'auto' }}
          >
            <option value="all">Sab Stock</option>
            <option value="in">In Stock Only</option>
            <option value="out">Out of Stock Only</option>
          </select>

          <Link
            href="/sale"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>Live Sale Page</span>
            <span style={{ fontSize: 13 }}>↗</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-panel">
        {rows.length === 0 ? (
          <div className="admin-empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
              {items.length === 0
                ? 'Abhi koi Sale product add nahi kiya gaya.'
                : 'Is filter se koi sale product nahi mila.'}
            </p>
            <p className="admin-hint" style={{ marginBottom: 16 }}>
              Aap ek hi product ke multiple colors aik hi baar upload kar sakte hain.
            </p>
            <Link href="/admin/sale/new" className="admin-btn">
              + Upload Sale Products (Multi-Color)
            </Link>
          </div>
        ) : (
          rows.map((product) => {
            const isBusy = busy === product.id;
            const isRemoving = removingId === product.id;
            const discount =
              product.compareAtPrice && product.compareAtPrice > product.price
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : null;

            return (
              <div
                className="admin-product"
                key={product.id}
                style={isRemoving ? { opacity: 0.4, pointerEvents: 'none', transition: 'opacity 0.3s' } : undefined}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p className="admin-product-name">{product.name}</p>
                    {discount && (
                      <span
                        style={{
                          backgroundColor: '#FFF0F0',
                          color: '#B42318',
                          border: '1px solid #F0C8C8',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {discount}% OFF
                      </span>
                    )}
                    {product.badge && (
                      <span
                        style={{
                          backgroundColor: 'rgba(201, 162, 39, 0.15)',
                          color: 'var(--adm-gold-text)',
                          border: '1px solid rgba(201, 162, 39, 0.3)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="admin-product-meta">
                    {product.brand || 'No brand'} · {product.category || 'No category'}
                    {product.fabricType ? ` · ${product.fabricType}` : ''}
                    {product.colors.length > 0 && ` · Color: ${product.colors[0].name}`}
                  </p>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span className="admin-product-price" style={{ color: '#0E3B2C', fontWeight: 700 }}>
                    Rs. {product.price.toLocaleString('en-PK')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span
                      style={{
                        fontSize: 11,
                        textDecoration: 'line-through',
                        color: 'rgba(16, 35, 28, 0.45)',
                      }}
                    >
                      Rs. {product.compareAtPrice.toLocaleString('en-PK')}
                    </span>
                  )}
                </div>

                <span
                  className="admin-badge"
                  data-status={product.isInStock ? 'delivered' : 'cancelled'}
                >
                  {product.isInStock ? 'In Stock' : 'Out of Stock'}
                </span>

                <span className="admin-product-buttons">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    disabled={isBusy}
                    onClick={() => toggleStock(product)}
                    title={product.isInStock ? 'Mark out of stock' : 'Mark in stock'}
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
                  {isRemoving ? (
                    <span style={{ fontSize: 12, color: '#B42318', fontWeight: 600 }}>Removing from Sale…</span>
                  ) : confirmingSaleId === product.id ? (
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        disabled={isBusy}
                        onClick={() => executeRemoveFromSale(product)}
                      >
                        Confirm Hatayein?
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => setConfirmingSaleId(null)}
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
                      onClick={() => setConfirmingSaleId(product.id)}
                      title="Sale page se hatayein"
                    >
                      Remove from Sale
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
