'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudinaryUploader } from '@/components/admin/CloudinaryUploader';
import { ProductQuickPreview } from '@/components/admin/ProductQuickPreview';
import {
  AdminActions,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminSection,
  AdminTextarea,
  AdminToggle,
  notify,
} from '@/components/admin/ui';
import {
  validateProduct,
  hasErrors,
  type ProductErrors,
  type ProductFormValues,
} from '@/lib/admin/validate-product';
import type { AdminProduct } from '@/lib/db/catalogue';
import type { Brand, Category, ColorVariant } from '@/lib/data';

const EMPTY: ProductFormValues = {
  title: '',
  slug: '',
  price: '',
  compareAtPrice: '',
  stockQuantity: '',
  brandSlug: '',
  categorySlug: '',
  description: '',
  fabricType: '',
  length: '',
  width: '',
  season: '',
  weaveType: '',
  badge: '',
  sku: '',
  imageAlt: '',
};

function initialForm(product: AdminProduct | null): ProductFormValues {
  if (!product) return { ...EMPTY, stockQuantity: '50' };
  return {
    title: product.name,
    slug: product.slug,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
    stockQuantity: String(product.stockQuantity),
    brandSlug: product.brandSlug,
    categorySlug: product.categorySlug,
    description: product.description,
    fabricType: product.fabricType,
    length: product.length,
    width: product.width,
    season: product.season,
    weaveType: product.weaveType,
    badge: product.badge ?? '',
    sku: product.sku ?? '',
    imageAlt: product.imageAlt ?? '',
  };
}

/** "Royal Karandi Charcoal" → "royal-karandi-charcoal" */
function suggestSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product: AdminProduct | null;
  brands: (Brand & { id: string })[];
  categories: (Category & { id: string })[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [values, setValues] = useState<ProductFormValues>(() => initialForm(product));
  const [errors, setErrors] = useState<ProductErrors>({});
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [colors, setColors] = useState<ColorVariant[]>(product?.colors ?? []);
  const [alsoIn, setAlsoIn] = useState<string[]>(product?.alsoIn ?? []);
  const [flags, setFlags] = useState({
    isInStock: product?.isInStock ?? true,
    isFeatured: product?.isFeatured ?? false,
    isBestseller: product?.isBestseller ?? false,
    priceOnInquiry: product?.priceOnInquiry ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [quickPreviewOpen, setQuickPreviewOpen] = useState(false);

  const set = (key: keyof ProductFormValues, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = suggestSlug(value);
      return next;
    });
    setDirty(true);
    if (errors[key as keyof ProductErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.slug, label: b.name })),
    [brands]
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.slug, label: c.name })),
    [categories]
  );

  async function submit() {
    const found = validateProduct(values);
    if (hasErrors(found)) {
      setErrors(found);
      setSaveError('Kuch fields theek nahi. Neeche laal messages dekhein.');
      document.querySelector<HTMLElement>('.admin-error')?.scrollIntoView({ block: 'center' });
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products';
      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...values,
          images,
          colorVariants: colors,
          alsoIn: alsoIn.filter((s) => s !== values.categorySlug),
          ...flags,
        }),
      });

      const body = await response.json().catch(() => ({ ok: false }));

      if (!response.ok) {
        if (body.errors) setErrors(body.errors);
        setSaveError(
          body.error ||
            'Save nahi ho paya. Kuch bhi change nahi hua — dobara try karein.'
        );
        return;
      }

      notify(isEdit ? 'Product save ho gaya' : 'Naya product add ho gaya');
      router.push('/admin/products');
      router.refresh();
    } catch {
      setSaveError('Server se connection nahi ho paya. Internet check karke dobara try karein.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product) return;
    const confirmed = window.confirm(
      `"${product.name}" hamesha ke liye delete ho jayega. Aap sure hain?`
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ ok: false }));
        setSaveError(body.error || 'Delete nahi ho paya. Dobara try karein.');
        return;
      }
      notify('Product delete ho gaya');
      router.push('/admin/products');
      router.refresh();
    } catch {
      setSaveError('Server se connection nahi ho paya.');
    } finally {
      setSaving(false);
    }
  }

  const previewBrand = brandOptions.find((b) => b.value === values.brandSlug)?.label ?? '';
  const previewData = {
    title: values.title,
    brand: previewBrand,
    price: Number(values.price || 0),
    compareAtPrice: Number(values.compareAtPrice || 0),
    badge: values.badge,
    imageUrl: images[0] ?? '',
    imageAlt: values.imageAlt,
    isInStock: flags.isInStock,
    priceOnInquiry: flags.priceOnInquiry,
    isFeatured: flags.isFeatured,
    isBestseller: flags.isBestseller,
    season: values.season,
    fabricType: values.fabricType,
    description: values.description,
    colors,
  };

  return (
    <>
      <div className="admin-form-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => router.push('/admin/products')}
          >
            ← Wapas list pe
          </button>
          {product && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              style={{ color: '#B42318', borderColor: '#F0C8C8' }}
              onClick={remove}
              disabled={saving}
            >
              Delete product
            </button>
          )}
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={() => setQuickPreviewOpen((o) => !o)}
          style={{
            borderColor: quickPreviewOpen ? 'var(--adm-gold)' : undefined,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
          }}
          title={quickPreviewOpen ? 'Quick Preview band karein' : 'Quick Preview kholen'}
        >
          <span className="qp-live-dot" />
          <span>{quickPreviewOpen ? 'Close Preview' : '👁️ Quick Preview'}</span>
        </button>
      </div>

      <h1 className="admin-heading">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <p className="admin-subheading">
        {isEdit
          ? 'Jo badalna hai woh badlein — baaki fields jaise hain waise reh jayenge.'
          : 'Sirf 1, 2 aur 3 zaroori hain. Baaki sab baad me bhi bhar sakte hain.'}
      </p>

      {saveError && (
        <div className="admin-error" role="alert">
          {saveError}
        </div>
      )}

        {/* 1 ── Basic info ──────────────────────────────────── */}
        <AdminSection
          step={1}
          title="Basic Info"
          description="Yeh woh cheezein hain jo customer sabse pehle dekhta hai."
        >
          <AdminField
            label="Product name"
            required
            hint='Customer ko jo naam dikhega, jaise "Royal Karandi Charcoal". Brand ka naam shuru me likhna acha rehta hai.'
            error={errors.title}
          >
            <AdminInput
              type="text"
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Royal Karandi Charcoal"
            />
          </AdminField>

          <AdminField
            label="Address (slug)"
            required
            hint="Is product ka link. Naam likhte hi khud ban jata hai — tabdil karne ki zaroorat nahi. Sirf chhote harf, numbers aur dashes."
            error={errors.slug}
            note={
              values.slug ? (
                <p className="admin-hint" style={{ marginTop: 4 }}>
                  Link hoga: <code>/product/{values.slug}</code>
                </p>
              ) : null
            }
          >
            <AdminInput
              type="text"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', e.target.value);
              }}
              placeholder="royal-karandi-charcoal"
              spellCheck={false}
            />
          </AdminField>

          <div className="admin-grid">
            <AdminField
              label="Brand"
              hint="Neeche di list se chunein. Galat brand = product galat jagah dikhega."
            >
              <AdminSelect value={values.brandSlug} onChange={(e) => set('brandSlug', e.target.value)}>
                <option value="">— Brand nahi chunna —</option>
                {brandOptions.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField
              label="Category"
              hint="Kaunsi category me yeh product milega, jaise Winter Fabric ya Dulha Design."
            >
              <AdminSelect
                value={values.categorySlug}
                onChange={(e) => set('categorySlug', e.target.value)}
              >
                <option value="">— Category nahi chunni —</option>
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>

          <AdminField
            label="Also appears in"
            hint="Agar product doosri category mein bhi milta hai — jaise Astoor Cotton + Kapra dono mein. Warna khali chhorein."
          >
            <div className="flex flex-wrap gap-3">
              {categories
                .filter((c) => c.slug !== values.categorySlug)
                .map((c) => {
                  const checked = alsoIn.includes(c.slug);
                  return (
                    <label
                      key={c.slug}
                      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-sm border cursor-pointer transition-colors ${
                        checked
                          ? 'border-brand bg-cream text-brand'
                          : 'border-line text-ink hover:border-brand'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setDirty(true);
                          setAlsoIn((prev) =>
                            checked ? prev.filter((s) => s !== c.slug) : [...prev, c.slug]
                          );
                        }}
                        className="accent-[#0E3B2C]"
                      />
                      {c.name}
                    </label>
                  );
                })}
            </div>
          </AdminField>

          <div className="admin-grid">
            <AdminField
              label="SKU / internal code"
              hint="Sirf aapke liye. Dukan ke andar numbering ke liye — customer ko nahi dikhta. Khali bhi chhod sakte hain."
            >
              <AdminInput
                type="text"
                value={values.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="KCH-KRN-001"
              />
            </AdminField>

            <AdminField
              label="Badge"
              hint='Chhota label jo price ke upar aata hai — "New Arrival", "Bestseller", "Sale". Khali = koi badge nahi.'
              error={errors.badge}
            >
              <AdminInput
                type="text"
                value={values.badge}
                onChange={(e) => set('badge', e.target.value)}
                placeholder="New Arrival"
                maxLength={60}
              />
            </AdminField>
          </div>
        </AdminSection>

        {/* 2 ── Photos ──────────────────────────────────────── */}
        <AdminSection
          step={2}
          title="Photos"
          description="Pehli photo sabse important hai — yahi thumbnail list mein aur product hero pe nazar aati hai. Screen 3:4 portrait mein crop karti hai, is liye photo bhi waise banayein. Upload ke baad Cloudinary WebP mein serve hoti hai."
        >
          <CloudinaryUploader
            images={images}
            onChange={(next) => {
              setImages(next);
              setDirty(true);
            }}
            hint="1200 × 1600 px (3:4 portrait) — min 900 × 1200, max 15 MB per image"
            emptyHint="Abhi koi photo nahi. Pehli photo product list mein dikhegi — 1200 × 1600 px (3:4) upload karein."
            ariaLabel="Upload product images"
          />

          <AdminField
            label="Photo description (alt text)"
            hint="Screen readers aur Google ke liye photo ka bayaan. Jaise 'Charcoal grey karandi suit piece'. Khali chhod sakte hain."
          >
            <AdminInput
              type="text"
              value={values.imageAlt}
              onChange={(e) => set('imageAlt', e.target.value)}
              placeholder="Charcoal grey karandi suit piece"
            />
          </AdminField>
        </AdminSection>

        {/* 3 ── Pricing ──────────────────────────────────────── */}
        <AdminSection step={3} title="Pricing" description="Daam rupay me, baghair Rs. ya commas ke.">
          <div className="admin-grid">
            <AdminField
              label="Price (Rs.)"
              required
              hint="Sirf numbers likhein, jaise 4500."
              error={errors.price}
            >
              <AdminInput
                type="text"
                inputMode="decimal"
                value={values.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="4500"
              />
            </AdminField>

            <AdminField
              label="Original price (Rs.)"
              hint="Agar sale hai to purana daam. Customer ko strike-through me dikhega. Khali = koi sale nahi."
              error={errors.compareAtPrice}
            >
              <AdminInput
                type="text"
                inputMode="decimal"
                value={values.compareAtPrice}
                onChange={(e) => set('compareAtPrice', e.target.value)}
                placeholder="5200"
              />
            </AdminField>
          </div>

          <AdminToggle
            checked={flags.priceOnInquiry}
            onChange={(next) => {
              setFlags((f) => ({ ...f, priceOnInquiry: next }));
              setDirty(true);
            }}
            labelOn="Price on inquiry dikhayein"
            labelOff="Daam dikhayein"
            hint="On karne pe number ki jagah 'Price on Inquiry' likha aayega. Tab Price field khaali chhod dein."
          />
        </AdminSection>

        {/* 4 ── Fabric details ───────────────────────────────── */}
        <AdminSection
          step={4}
          title="Fabric Details"
          description="Customer fabric ka naam aur specification isi se samajhta hai. Sab fields optional hain."
        >
          <div className="admin-grid">
            <AdminField label="Fabric type" hint='Jaise "Karandi", "Khaddar", "Cotton".'>
              <AdminInput
                type="text"
                value={values.fabricType}
                onChange={(e) => set('fabricType', e.target.value)}
                placeholder="Karandi"
              />
            </AdminField>
            <AdminField label="Length" hint='Kitna piece hai, jaise "4.0 Meters Suit Piece".'>
              <AdminInput
                type="text"
                value={values.length}
                onChange={(e) => set('length', e.target.value)}
                placeholder="4.0 Meters Suit Piece"
              />
            </AdminField>
            <AdminField label="Width" hint='Chorai, jaise "54 Inches (Bara Bahr)".'>
              <AdminInput
                type="text"
                value={values.width}
                onChange={(e) => set('width', e.target.value)}
                placeholder="54 Inches (Bara Bahr)"
              />
            </AdminField>
            <AdminField label="Season" hint="Kaunke liye hai — Summer, Winter, ya all season.">
              <AdminInput
                type="text"
                value={values.season}
                onChange={(e) => set('season', e.target.value)}
                placeholder="Winter"
              />
            </AdminField>
            <AdminField label="Weave / bana" hint='Jaise "Plain", "Herringbone", "Jamawar".'>
              <AdminInput
                type="text"
                value={values.weaveType}
                onChange={(e) => set('weaveType', e.target.value)}
                placeholder="Plain"
              />
            </AdminField>
          </div>
        </AdminSection>

        {/* 5 ── Colours ──────────────────────────────────────── */}
        <AdminSection
          step={5}
          title="Colours"
          description="Product page par pehle 3 colours dikhte hain; baqi colours +N more ke andar milte hain. Jo rang stock me nahi, uska circle dheema hota hai."
        >
          {colors.length === 0 && (
            <p className="admin-hint" style={{ marginTop: 0, marginBottom: 14 }}>
              Koi rang add nahi kiya. Rang isliye zaroori hai ke customer ko options dikhein.
            </p>
          )}

          <div className="admin-color-list">
            {colors.map((color, index) => (
              <div className="admin-color-row" key={index}>
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => {
                    setColors((prev) =>
                      prev.map((c, i) => (i === index ? { ...c, hex: e.target.value } : c))
                    );
                    setDirty(true);
                  }}
                  className="admin-color-swatch"
                  aria-label={`Colour ${index + 1} swatch`}
                />
                <AdminInput
                  type="text"
                  value={color.name}
                  placeholder="Navy Blue"
                  onChange={(e) => {
                    setColors((prev) =>
                      prev.map((c, i) => (i === index ? { ...c, name: e.target.value } : c))
                    );
                    setDirty(true);
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ flexShrink: 0 }}
                  onClick={() => {
                    setColors((prev) =>
                      prev.map((c, i) => (i === index ? { ...c, inStock: !c.inStock } : c))
                    );
                    setDirty(true);
                  }}
                >
                  {color.inStock ? 'In stock' : 'Out of stock'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ color: '#B42318', flexShrink: 0 }}
                  title="Yeh rang hata dein"
                  onClick={() => {
                    setColors((prev) => prev.filter((_, i) => i !== index));
                    setDirty(true);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              setColors((prev) => [...prev, { name: '', hex: '#1B2A4A', inStock: true }]);
              setDirty(true);
            }}
          >
            + Rang add karein
          </button>
        </AdminSection>

        {/* 6 ── Stock & visibility ───────────────────────────── */}
        <AdminSection
          step={6}
          title="Stock & Visibility"
          description="Yahan se control karte hain ke product dikhna chahiye ya nahi."
        >
          <div className="admin-grid">
            <AdminField
              label="Quantity available"
              hint="Kitne pieces hain. Sirf poore numbers, jaise 50."
              error={errors.stockQuantity}
            >
              <AdminInput
                type="text"
                inputMode="numeric"
                value={values.stockQuantity}
                onChange={(e) => set('stockQuantity', e.target.value)}
                placeholder="50"
              />
            </AdminField>
          </div>

          <div className="admin-toggle-stack">
            <AdminToggle
              checked={flags.isInStock}
              onChange={(next) => {
                setFlags((f) => ({ ...f, isInStock: next }));
                setDirty(true);
              }}
              labelOn="In stock — abhi bik raha hai"
              labelOff="Out of stock — abhi nahi mil raha"
              hint="Out of stock karne pe Product page pe 'Currently Out of Stock' likha aata hai aur WhatsApp button band ho jata hai."
            />
            <AdminToggle
              checked={flags.isFeatured}
              onChange={(next) => {
                setFlags((f) => ({ ...f, isFeatured: next }));
                setDirty(true);
              }}
              labelOn="Home page pe dikhayein"
              labelOff="Home page pe mat dikhayein"
              hint="Featured products homepage ke 'Featured' section me aate hain."
            />
            <AdminToggle
              checked={flags.isBestseller}
              onChange={(next) => {
                setFlags((f) => ({ ...f, isBestseller: next }));
                setDirty(true);
              }}
              labelOn="Bestseller mark karein"
              labelOff="Bestseller nahi"
              hint="Sirf marketing ke liye — 'Bestseller' wale section me aata hai."
            />
          </div>
        </AdminSection>

        {/* 7 ── Description ─────────────────────────────────── */}
        <AdminSection
          step={7}
          title="Description"
          description="Achi tafseel se likhein — quality, kaam, aur kaun pehanta hai. Google isi ko padhta hai."
        >
          <AdminField
            label="Description"
            hint="2-4 jumle kaafi hain. Fabric, quality aur kis mausam ke liye hai, yeh batayein."
            error={errors.description}
            note={
              <p className="admin-hint" style={{ marginTop: 4 }}>
                {values.description.length} / 4000 harf
              </p>
            }
          >
            <AdminTextarea
              rows={6}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Premium karandi fabric, winter ke liye behtareen..."
            />
          </AdminField>
        </AdminSection>

      <AdminActions
        onSave={submit}
        onCancel={() => router.push('/admin/products')}
        saving={saving}
        dirty={dirty}
        saveLabel={isEdit ? 'Save changes' : 'Product add karein'}
      />

      {/* ── Screen-edge docked product live preview (screen se laga hua) ── */}
      <ProductQuickPreview
        data={previewData}
        isOpen={quickPreviewOpen}
        onToggle={() => setQuickPreviewOpen((o) => !o)}
      />
    </>
  );
}
