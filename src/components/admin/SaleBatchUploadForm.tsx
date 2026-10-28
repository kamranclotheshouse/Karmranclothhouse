'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudinaryUploader } from '@/components/admin/CloudinaryUploader';
import {
  AdminActions,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminSection,
  AdminTextarea,
  notify,
} from '@/components/admin/ui';
import type { Brand, Category } from '@/lib/data';

interface ColorVariantItem {
  id: string;
  colorName: string;
  colorHex: string;
  images: string[];
  stockQuantity: string;
}

export function SaleBatchUploadForm({
  brands,
  categories,
}: {
  brands: (Brand & { id: string })[];
  categories: (Category & { id: string })[];
}) {
  const router = useRouter();

  // Common details across all color variants
  const [title, setTitle] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [badge, setBadge] = useState('Sale');

  // Fabric specs
  const [fabricType, setFabricType] = useState('');
  const [length, setLength] = useState('4.0 Meters Suit Piece');
  const [width, setWidth] = useState('54 Inches (Bara Bahr)');
  const [season, setSeason] = useState('All Season');
  const [weaveType, setWeaveType] = useState('');
  const [description, setDescription] = useState('');

  // Variants list
  const [variants, setVariants] = useState<ColorVariantItem[]>([
    {
      id: 'var-1',
      colorName: 'Navy Blue',
      colorHex: '#1B2A4A',
      images: [],
      stockQuantity: '50',
    },
    {
      id: 'var-2',
      colorName: 'Maroon',
      colorHex: '#6A1A24',
      images: [],
      stockQuantity: '50',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.slug, label: b.name })),
    [brands]
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.slug, label: c.name })),
    [categories]
  );

  function addVariant() {
    const id = `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setVariants((prev) => [
      ...prev,
      {
        id,
        colorName: '',
        colorHex: '#10231C',
        images: [],
        stockQuantity: '50',
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) {
      alert('Kam az kam aik colour hona zaroori hai.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, patch: Partial<ColorVariantItem>) {
    setVariants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  const discountPercent = useMemo(() => {
    const p = Number(price);
    const cp = Number(compareAtPrice);
    if (p > 0 && cp > p) {
      return Math.round(((cp - p) / cp) * 100);
    }
    return null;
  }, [price, compareAtPrice]);

  async function submit() {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = 'Product ka naam likhein.';
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      nextErrors.price = 'Sahi sale daam likhein (sirf numbers).';
    }
    if (compareAtPrice.trim() && isNaN(Number(compareAtPrice))) {
      nextErrors.compareAtPrice = 'Original daam sirf numbers mein likhein.';
    }

    if (variants.length === 0) {
      nextErrors.variants = 'Kam az kam aik colour add karein.';
    }

    // Check that at least one variant has either a color name or image
    let hasValidVariant = false;
    for (const v of variants) {
      if (v.colorName.trim() || v.images.length > 0) {
        hasValidVariant = true;
        break;
      }
    }
    if (!hasValidVariant) {
      nextErrors.variants = 'Kisi aik colour ka naam ya photo zaroor dalein.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstErrorMessage =
        nextErrors.title || nextErrors.price || nextErrors.variants || 'Form mein kuch fields adhoori hain.';
      setSaveError(firstErrorMessage);
      notify(firstErrorMessage, 'error');

      setTimeout(() => {
        // aria-invalid="true" is set on the actual invalid input by AdminField
        const invalidInput = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (invalidInput) {
          invalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          invalidInput.focus();
        } else {
          // Fallback: scroll to the first error alert or the top error banner
          const alertEl = document.querySelector<HTMLElement>('[role="alert"]');
          if (alertEl) {
            alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 50);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/admin/sale/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          brandSlug: brandSlug || null,
          categorySlug: categorySlug || null,
          price: Number(price),
          compareAtPrice: compareAtPrice.trim() ? Number(compareAtPrice) : null,
          badge: badge.trim() || 'Sale',
          fabricType: fabricType.trim() || null,
          fabricLength: length.trim() || null,
          fabricWidth: width.trim() || null,
          season: season.trim() || null,
          weaveType: weaveType.trim() || null,
          description: description.trim() || null,
          variants: variants.map((v) => ({
            colorName: v.colorName.trim(),
            colorHex: v.colorHex,
            images: v.images,
            stockQuantity: Number(v.stockQuantity) || 50,
          })),
        }),
      });

      const body = await response.json().catch(() => ({ ok: false }));

      if (!response.ok || !body.ok) {
        if (body.errors) setErrors(body.errors);
        setSaveError(body.error || 'Upload nahi ho paya. Dobara try karein.');
        return;
      }

      notify(`${body.createdCount ?? variants.length} Sale products kamiyabi se upload ho gaye!`);
      router.push('/admin/sale');
      router.refresh();
    } catch {
      setSaveError('Server se connection nahi ho paya. Dobara try karein.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="admin-form-topbar">
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => router.push('/admin/sale')}
        >
          ← Wapas Sale list pe
        </button>
      </div>

      <h1 className="admin-heading">Upload Sale Products (Multi-Color)</h1>
      <p className="admin-subheading">
        Aik hi product ki details (Brand, Category, Price, Fabric) aik martaba likhein, aur alag alag colours ki photos add karein. Har colour ka alag product khud ban jayega aur Sale page pe dikhega.
      </p>

      {saveError && (
        <div className="admin-error" role="alert" style={{ marginBottom: 20 }}>
          {saveError}
        </div>
      )}

      {/* ── 1. Basic Info ── */}
      <AdminSection
        step={1}
        title="Product Details (Common for All Colors)"
        description="Yeh details sab color variants ke liye ek jaisi rahengi."
      >
        <AdminField
          label="Product base name"
          required
          hint='Product ka asil naam, jaise "Royal Karandi Embroidered Suit" ya "Pashmina Shawl Suit". Rang ka naam aage khud jud jayega.'
          error={errors.title}
        >
          <AdminInput
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Royal Karandi Embroidered Suit"
          />
        </AdminField>

        <div className="admin-grid">
          <AdminField
            label="Brand"
            hint="Brand chunein jiska yeh product hai."
          >
            <AdminSelect
              value={brandSlug}
              onChange={(e) => setBrandSlug(e.target.value)}
            >
              <option value="">— Brand chunein —</option>
              {brandOptions.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>

          <AdminField
            label="Category"
            hint="Category chunein jaise Winter Fabric, Cotton, etc."
          >
            <AdminSelect
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              <option value="">— Category chunein —</option>
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
        </div>

        <div className="admin-grid">
          <AdminField
            label="Sale Price (Rs.)"
            required
            hint="Discounted / Sale daam (e.g. 2999)."
            error={errors.price}
          >
            <AdminInput
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
              }}
              placeholder="2999"
            />
          </AdminField>

          <AdminField
            label="Original / Normal Price (Rs.)"
            hint="Purana daam jo strike-through hoga (e.g. 4500)."
            error={errors.compareAtPrice}
            note={
              discountPercent ? (
                <p className="admin-hint" style={{ marginTop: 4, color: '#B42318', fontWeight: 600 }}>
                  Customer ko {discountPercent}% OFF dikhega!
                </p>
              ) : null
            }
          >
            <AdminInput
              type="text"
              inputMode="decimal"
              value={compareAtPrice}
              onChange={(e) => {
                setCompareAtPrice(e.target.value);
                if (errors.compareAtPrice) setErrors((prev) => ({ ...prev, compareAtPrice: '' }));
              }}
              placeholder="4500"
            />
          </AdminField>
        </div>

        <AdminField
          label="Badge label"
          hint='Product ke card pe gold label (e.g. "Sale", "Clearance", "Special Offer").'
        >
          <AdminInput
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Sale"
          />
        </AdminField>
      </AdminSection>

      {/* ── 2. Color Variants & Photos ── */}
      <AdminSection
        step={2}
        title="Colours & Photos (Har Colour ka Alag Product Banega)"
        description="Neeche har rang ka naam likhein aur us rang ki photo upload karein. Jitne colours yahan add karenge, utne products Sale page pe khud create ho jayenge!"
      >
        {errors.variants && (
          <div className="admin-error" style={{ marginBottom: 12 }}>
            {errors.variants}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {variants.map((v, index) => (
            <div
              key={v.id}
              style={{
                backgroundColor: '#FAFCFB',
                border: '1px solid var(--adm-border)',
                borderRadius: 'var(--adm-radius)',
                padding: '18px 20px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                  borderBottom: '1px solid rgba(16,35,28,0.06)',
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: '#0E3B2C',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#10231C' }}>
                    {v.colorName ? `${v.colorName} Colour` : `Colour #${index + 1}`}
                  </span>
                </div>

                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    style={{ color: '#B42318', borderColor: '#F0C8C8' }}
                  >
                    ✕ Remove Colour
                  </button>
                )}
              </div>

              <div className="admin-grid" style={{ marginBottom: 14 }}>
                <AdminField label="Colour Name" required hint='Jaise "Navy Blue", "Emerald Green", "Jet Black".'>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={v.colorHex}
                      onChange={(e) => updateVariant(index, { colorHex: e.target.value })}
                      className="admin-color-swatch"
                      title="Colour swatch chunein"
                    />
                    <AdminInput
                      type="text"
                      value={v.colorName}
                      placeholder="Navy Blue"
                      onChange={(e) => updateVariant(index, { colorName: e.target.value })}
                    />
                  </div>
                </AdminField>

                <AdminField label="Stock Quantity" hint="Kitne pieces is colour ke paas hain.">
                  <AdminInput
                    type="text"
                    inputMode="numeric"
                    value={v.stockQuantity}
                    placeholder="50"
                    onChange={(e) => updateVariant(index, { stockQuantity: e.target.value })}
                  />
                </AdminField>
              </div>

              <AdminField
                label={`${v.colorName ? `"${v.colorName}"` : 'Is Colour'} Ki Photo(s)`}
                hint="Is specific colour ki 3:4 portrait photo upload karein (min 900x1200)."
              >
                <CloudinaryUploader
                  images={v.images}
                  onChange={(images) => updateVariant(index, { images })}
                  hint="Pehli photo hero / card thumbnail banegi"
                  emptyHint="Is colour ki photo upload karne ke liye click ya drop karein"
                  ariaLabel={`Upload photos for colour ${index + 1}`}
                />
              </AdminField>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="admin-btn admin-btn--ghost"
          style={{
            marginTop: 18,
            width: '100%',
            padding: '12px 16px',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: 'var(--adm-gold)',
            color: 'var(--adm-gold-text)',
            fontWeight: 600,
          }}
        >
          + Aur Colour Add Karein ({variants.length} added so far)
        </button>
      </AdminSection>

      {/* ── 3. Fabric Specs & Description ── */}
      <AdminSection
        step={3}
        title="Fabric Specifications & Description (Optional)"
        description="Fabric ki tafseelat jo product page pe dikhengi."
      >
        <div className="admin-grid">
          <AdminField label="Fabric Type" hint='Jaise "Karandi", "Cotton", "Wool".'>
            <AdminInput
              type="text"
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              placeholder="Karandi"
            />
          </AdminField>
          <AdminField label="Length" hint='Jaise "4.0 Meters Suit Piece".'>
            <AdminInput
              type="text"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="4.0 Meters Suit Piece"
            />
          </AdminField>
          <AdminField label="Width" hint='Jaise "54 Inches (Bara Bahr)".'>
            <AdminInput
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="54 Inches (Bara Bahr)"
            />
          </AdminField>
          <AdminField label="Season" hint="Summer, Winter, All Season.">
            <AdminInput
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="Winter"
            />
          </AdminField>
          <AdminField label="Weave Type" hint="Plain, Jamawar, Herringbone.">
            <AdminInput
              type="text"
              value={weaveType}
              onChange={(e) => setWeaveType(e.target.value)}
              placeholder="Plain"
            />
          </AdminField>
        </div>

        <AdminField label="Description" hint="Customer ke liye fabric ki khoobian.">
          <AdminTextarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Special clearance sale: Premium quality unstitched suit fabric..."
          />
        </AdminField>
      </AdminSection>

      {/* ── 4. Live Preview Summary ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(201,162,39,0.3)',
          borderRadius: 'var(--adm-radius)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            margin: '0 0 10px 0',
            fontFamily: "'Playfair Display', serif",
            fontSize: 17,
            color: '#0E3B2C',
          }}
        >
          📋 Generation Summary: {variants.length} Sale Products Create Honge
        </h3>
        <p className="admin-hint" style={{ marginBottom: 14 }}>
          Aap &apos;Upload All Products&apos; pe click karenge to neeche diye gaye {variants.length} products Sale catalogue me add ho jayenge:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {variants.map((v, i) => {
            const variantTitle = title.trim()
              ? v.colorName.trim()
                ? `${title.trim()} - ${v.colorName.trim()}`
                : title.trim()
              : `Product #${i + 1} (${v.colorName || 'No color name'})`;

            return (
              <div
                key={v.id}
                style={{
                  border: '1px solid var(--adm-border)',
                  borderRadius: 6,
                  padding: 10,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  backgroundColor: '#FAFCFB',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 64,
                    backgroundColor: '#EBEBEB',
                    borderRadius: 4,
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {v.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.images[0]}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#888',
                      }}
                    >
                      No photo
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      margin: 0,
                      color: '#10231C',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {variantTitle}
                  </p>
                  <p style={{ fontSize: 11, color: '#0E3B2C', fontWeight: 700, margin: '2px 0 0 0' }}>
                    Rs. {price ? Number(price).toLocaleString('en-PK') : '0'}
                    {compareAtPrice && Number(compareAtPrice) > Number(price) && (
                      <span
                        style={{
                          fontSize: 10,
                          textDecoration: 'line-through',
                          color: '#888',
                          marginLeft: 6,
                          fontWeight: 400,
                        }}
                      >
                        Rs. {Number(compareAtPrice).toLocaleString('en-PK')}
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--adm-muted)', margin: '2px 0 0 0' }}>
                    Badge: <span style={{ color: 'var(--adm-gold-text)' }}>{badge || 'Sale'}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {saveError && (
        <div className="admin-error" role="alert" style={{ marginBottom: 16 }}>
          ⚠️ {saveError} (Upar laal fields check karein)
        </div>
      )}

      <AdminActions
        onSave={submit}
        onCancel={() => router.push('/admin/sale')}
        saving={saving}
        dirty={true}
        saveLabel={`Upload All ${variants.length} Sale Products`}
      />
    </>
  );
}
