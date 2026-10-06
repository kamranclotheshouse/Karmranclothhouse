'use client';

import { useState } from 'react';
import type { ColorVariant } from '@/lib/data';

export interface ProductQuickPreviewData {
  title: string;
  brand: string;
  price: number;
  compareAtPrice: number;
  badge: string;
  imageUrl: string;
  imageAlt: string;
  isInStock: boolean;
  priceOnInquiry: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  season: string;
  fabricType: string;
  description: string;
  colors: ColorVariant[];
}

function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString('en-PK')}`;
}

export function ProductQuickPreview({
  data,
  isOpen,
  onToggle,
}: {
  data: ProductQuickPreviewData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [view, setView] = useState<'card' | 'page'>('card');

  const hasDiscount = data.compareAtPrice > 0 && data.compareAtPrice > data.price;
  const discountPct = hasDiscount
    ? Math.round(((data.compareAtPrice - data.price) / data.compareAtPrice) * 100)
    : 0;

  return (
    <>
      {/* ── Screen-edge docked tab button (screen se laga hua) ── */}
      <button
        type="button"
        className={`qp-dock-tab ${isOpen ? 'qp-dock-tab--active' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Quick Preview band karein' : 'Quick Preview kholen'}
        aria-label="Quick Preview Toggle"
      >
        <span className="qp-live-dot" />
        <span className="qp-dock-tab-text">
          {isOpen ? 'Close Preview' : 'Quick Preview'}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
          }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ── Slide-in Quick Preview Drawer ── */}
      {isOpen && (
        <aside className="qp-drawer" aria-label="Product live preview drawer">
          {/* Header */}
          <div className="qp-header">
            <div className="qp-header-title">
              <span className="qp-live-dot" />
              <span>LIVE PREVIEW</span>
              <span className="qp-header-tag">Instant</span>
            </div>

            <div className="qp-header-actions">
              <div className="qp-view-toggle">
                <button
                  type="button"
                  className={`qp-view-btn ${view === 'card' ? 'qp-view-btn--active' : ''}`}
                  onClick={() => setView('card')}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={`qp-view-btn ${view === 'page' ? 'qp-view-btn--active' : ''}`}
                  onClick={() => setView('page')}
                >
                  Page
                </button>
              </div>

              <button
                type="button"
                className="qp-close-btn"
                onClick={onToggle}
                aria-label="Close Preview"
                title="Preview band karein"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="qp-body">
            {view === 'card' ? (
              /* ── Storefront Card Preview ── */
              <div className="qp-card">
                {/* Image Wrap */}
                <div className="qp-card-media">
                  {data.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.imageUrl}
                      alt={data.imageAlt || data.title || 'Product'}
                      className="qp-card-img"
                    />
                  ) : (
                    <div className="qp-card-empty-img">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.35"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Photo form me add karein</span>
                    </div>
                  )}

                  {/* Badges */}
                  {data.badge && <span className="qp-badge qp-badge--gold">{data.badge}</span>}
                  {!data.isInStock && (
                    <span className="qp-badge qp-badge--oos">Out of Stock</span>
                  )}
                  {hasDiscount && (
                    <span className="qp-badge qp-badge--sale">−{discountPct}%</span>
                  )}
                </div>

                {/* Info */}
                <div className="qp-card-content">
                  {data.brand && <p className="qp-card-brand">{data.brand}</p>}
                  <h3 className="qp-card-title">
                    {data.title || <span className="qp-placeholder-text">Product name yahan aayega…</span>}
                  </h3>

                  {/* Fabric Specs Tag */}
                  {(data.fabricType || data.season) && (
                    <p className="qp-card-meta">
                      {[data.fabricType, data.season].filter(Boolean).join(' • ')}
                    </p>
                  )}

                  {/* Colors */}
                  {data.colors.length > 0 && (
                    <div className="qp-card-colors">
                      {data.colors.slice(0, 6).map((c, i) => (
                        <span
                          key={i}
                          className="qp-color-dot"
                          style={{
                            backgroundColor: c.hex || '#0E3B2C',
                            opacity: c.inStock ? 1 : 0.35,
                          }}
                          title={`${c.name} (${c.inStock ? 'In stock' : 'Out of stock'})`}
                        />
                      ))}
                      {data.colors.length > 6 && (
                        <span className="qp-color-more">+{data.colors.length - 6}</span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="qp-card-price-row">
                    {data.priceOnInquiry ? (
                      <span className="qp-price-inquiry">Price on Inquiry</span>
                    ) : (
                      <>
                        <span className="qp-price">
                          {data.price > 0 ? formatPrice(data.price) : 'Rs. —'}
                        </span>
                        {hasDiscount && (
                          <span className="qp-price-strike">
                            {formatPrice(data.compareAtPrice)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    className="qp-card-cta"
                    disabled={!data.isInStock}
                    tabIndex={-1}
                  >
                    {data.isInStock ? 'View Details' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Detail Hero Preview ── */
              <div className="qp-detail">
                <div className="qp-detail-media">
                  {data.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.imageUrl}
                      alt={data.imageAlt || data.title}
                      className="qp-detail-img"
                    />
                  ) : (
                    <div className="qp-detail-empty-img">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>No Photo Uploaded</span>
                    </div>
                  )}
                  {data.badge && <span className="qp-badge qp-badge--gold">{data.badge}</span>}
                </div>

                <div className="qp-detail-content">
                  {data.brand && <p className="qp-card-brand">{data.brand}</p>}
                  <h2 className="qp-detail-title">
                    {data.title || <span className="qp-placeholder-text">Product name…</span>}
                  </h2>

                  <div className="qp-card-price-row">
                    {data.priceOnInquiry ? (
                      <span className="qp-price-inquiry">Price on Inquiry</span>
                    ) : (
                      <>
                        <span className="qp-price qp-price--lg">
                          {data.price > 0 ? formatPrice(data.price) : 'Rs. —'}
                        </span>
                        {hasDiscount && (
                          <span className="qp-price-strike">
                            {formatPrice(data.compareAtPrice)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {!data.isInStock && (
                    <p className="qp-badge-oos-text">⚠️ Currently Out of Stock</p>
                  )}

                  {data.colors.length > 0 && (
                    <div className="qp-detail-section">
                      <p className="qp-detail-section-label">Rang / Colours ({data.colors.length})</p>
                      <div className="qp-detail-color-list">
                        {data.colors.map((c, i) => (
                          <span
                            key={i}
                            className="qp-detail-color-pill"
                            style={{ opacity: c.inStock ? 1 : 0.4 }}
                          >
                            <span
                              className="qp-detail-swatch"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.name || 'Unnamed'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(data.fabricType || data.season) && (
                    <div className="qp-detail-specs">
                      {data.fabricType && (
                        <div className="qp-spec-item">
                          <span className="qp-spec-label">Fabric</span>
                          <span className="qp-spec-val">{data.fabricType}</span>
                        </div>
                      )}
                      {data.season && (
                        <div className="qp-spec-item">
                          <span className="qp-spec-label">Season</span>
                          <span className="qp-spec-val">{data.season}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {data.description && (
                    <p className="qp-detail-desc">{data.description}</p>
                  )}

                  <button
                    type="button"
                    className="qp-detail-order-btn"
                    disabled={!data.isInStock}
                    tabIndex={-1}
                  >
                    {data.isInStock ? '💬 Order via WhatsApp' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="qp-footer">
            <span className="qp-live-dot" />
            <span>Form mein type karein — bina save kiye yahan fauran update hoga</span>
          </div>
        </aside>
      )}
    </>
  );
}
