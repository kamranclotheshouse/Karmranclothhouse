'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminField,
  AdminInput,
  AdminSection,
  AdminTextarea,
  AdminToggle,
  notify,
} from '@/components/admin/ui';
import {
  hasTaxonomyErrors,
  validateTaxonomy,
  type TaxonomyErrors,
  type TaxonomyFormValues,
} from '@/lib/admin/validate-taxonomy';
import { CloudinaryUploader } from '@/components/admin/CloudinaryUploader';

/** The shape both categories and brands are mapped to before rendering. */
export interface TaxonomyRow {
  id: string;
  name: string;
  slug: string;
  sub: string;
  description: string;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount: number;
}

const EMPTY: TaxonomyFormValues & { isActive: boolean; isFeatured: boolean; sortOrder: number } = {
  name: '',
  slug: '',
  sub: '',
  description: '',
  image: '',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

const SLUGIFY = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface Props {
  kind: 'category' | 'brand';
  rows: TaxonomyRow[];
}

export function TaxonomyManager({ kind, rows }: Props) {
  const router = useRouter();
  const isBrand = kind === 'brand';

  const [values, setValues] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<TaxonomyErrors>({});
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const noun = isBrand ? 'Brand' : 'Category';
  const endpoint = isBrand ? '/api/admin/brands' : '/api/admin/categories';

  const startEdit = (row: TaxonomyRow) => {
    setEditingId(row.id);
    setErrors({});
    setValues({
      name: row.name,
      slug: row.slug,
      sub: row.sub,
      description: row.description,
      image: row.image,
      isActive: row.isActive,
      isFeatured: row.isFeatured,
      sortOrder: row.sortOrder,
    });
    // Keep the current scroll position so editing a row does not unexpectedly
    // jump the admin back to the top of the page.
  };

  const reset = () => {
    setEditingId(null);
    setErrors({});
    setValues(EMPTY);
  };

  const setField = (key: keyof typeof EMPTY, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Keep the address in step with the name until the admin edits it by hand.
      if (key === 'name' && !editingId) next.slug = SLUGIFY(value);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateTaxonomy(values, kind);
    if (hasTaxonomyErrors(fieldErrors)) {
      setErrors(fieldErrors);
      notify('Kuch fields theek nahi hain — neeche dekhein.', 'error');
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const payload = { ...values };
      const res = await fetch(editingId ? `${endpoint}/${editingId}` : endpoint, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        notify(data.error ?? 'Save nahi ho saka.', 'error');
        return;
      }

      notify(editingId ? `${values.name} update ho gaya.` : `${values.name} add ho gaya.`);
      reset();
      router.refresh();
    } catch {
      notify('Network problem — kuch save nahi hua.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (row: TaxonomyRow) => {
    setBusy(true);
    try {
      const res = await fetch(`${endpoint}/${row.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify(data.error ?? 'Delete nahi ho saka.', 'error');
        return;
      }
      if (editingId === row.id) reset();
      setConfirmId(null);
      notify(
        data.orphanedProducts > 0
          ? `${row.name} delete — ${data.orphanedProducts} product(s) ab bina ${noun.toLowerCase()} ke hain.`
          : `${row.name} delete ho gaya.`
      );
      router.refresh();
    } catch {
      notify('Network problem — delete nahi hua.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const totalProducts = useMemo(() => rows.reduce((n, r) => n + r.productCount, 0), [rows]);

  return (
    <>
      <h1 className="admin-heading">{isBrand ? 'Brands' : 'Categories'}</h1>
      <p className="admin-subheading">
        {isBrand
          ? 'Add, rename and hide the brands your customers shop by.'
          : 'Add, rename and hide the collections your products are grouped into.'}
      </p>

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit} noValidate>
        <AdminSection
          step={1}
          title={editingId ? `Edit ${noun}` : `New ${noun}`}
          description={
            editingId
              ? `Changes here go live on the storefront straight away. Only fields you change are written.`
              : `${noun}s appear on the storefront as soon as you save. Nothing is published until you press save.`
          }
          action={
            editingId ? (
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={reset}>
                Cancel edit
              </button>
            ) : undefined
          }
        >
          <div className="admin-grid">
            <AdminField
              label={`${noun} name`}
              required
              hint={`Customers see this. Write it exactly as you want it to appear, jaise ${isBrand ? 'Gul Ahmed' : 'Winter Fabric'}.`}
              error={errors.name}
            >
              <AdminInput
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder={isBrand ? 'Gul Ahmed' : 'Winter Fabric'}
                aria-invalid={Boolean(errors.name)}
              />
            </AdminField>

            <AdminField
              label="Web address (slug)"
              hint={
                editingId
                  ? 'Address bar me dikhne wala hissa. Badalne se purane links toot jayenge.'
                  : 'Apne aap naam se ban jata hai. Sirf chhote letters aur dashes, jaise "winter-fabric".'
              }
              error={errors.slug}
            >
              <AdminInput
                value={values.slug}
                onChange={(e) => setField('slug', e.target.value)}
                placeholder={isBrand ? 'gul-ahmed' : 'winter-fabric'}
                aria-invalid={Boolean(errors.slug)}
              />
            </AdminField>

            <AdminField
              label={isBrand ? 'Tagline' : 'Short line under the title'}
              hint={
                isBrand
                  ? 'Ek chhoti line jo brand ke neeche dikhti hai, jaise "Premium Lawn".'
                  : 'Chhota gold line jo category title ke neeche aati hai, jaise "Warm & Cosy".'
              }
              error={errors.sub}
            >
              <AdminInput
                value={values.sub}
                onChange={(e) => setField('sub', e.target.value)}
                placeholder={isBrand ? 'Premium Lawn' : 'Warm & Cosy'}
                maxLength={150}
              />
            </AdminField>

            <AdminField
              label={isBrand ? 'Logo photo' : 'Cover photo'}
              hint={
                isBrand
                  ? 'Transparent PNG — 600 × 300 px. Background clear rakhein taake har jagah saaf dikhe. Khali chhod dein to naam ka pehla letter circle me dikhega.'
                  : 'Card 4:5 aur dropdown 4:3 dono jagah crop hoti hai — 1600 × 1200 px (4:3 landscape) plain/texture photo best fit bethegi.'
              }
              error={errors.image}
            >
              <CloudinaryUploader
                single
                images={values.image ? [values.image] : []}
                onChange={(next) => setField('image', next[0] ?? '')}
                hint={
                  isBrand
                    ? 'PNG (transparent) — 600 × 300 px, max 5 MB'
                    : '1600 × 1200 px (4:3 landscape), max 10 MB'
                }
                emptyHint={
                  isBrand
                    ? 'Abhi logo nahi. Transparent PNG yahan upload karein.'
                    : 'Abhi cover photo nahi. Category ki photo yahan upload karein.'
                }
                ariaLabel={isBrand ? 'Upload brand logo' : 'Upload category cover image'}
              />
            </AdminField>
          </div>

          <AdminField
            label="Description"
            hint="Ek ya do lines — SEO aur category page ke liye. 600 characters tak."
            error={errors.description}
            note={
              <p className="admin-hint" style={{ marginTop: 4 }}>
                {values.description.length}/600 characters
              </p>
            }
          >
            <AdminTextarea
              rows={3}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Warm winter woolen fabric for the whole family — khaddar, karandi and more."
              maxLength={600}
            />
          </AdminField>

          <div className="admin-grid">
            <AdminField label="Sort order" hint="Chhota number = pehle dikhega. 0 sabse upar.">
              <AdminInput
                type="number"
                value={String(values.sortOrder)}
                onChange={(e) => setField('sortOrder', e.target.value)}
              />
            </AdminField>

            <div className="admin-field">
              <span className="admin-label">Visibility</span>
              <AdminToggle
                checked={values.isActive}
                onChange={(v) => setValues((p) => ({ ...p, isActive: v }))}
                labelOn="Show on storefront"
                labelOff="Hidden from storefront"
                hint={
                  values.isActive
                    ? 'Customers can see this right now.'
                    : 'Hidden — products inside it stay visible but this listing will not.'
                }
              />
            </div>

            {isBrand && (
              <div className="admin-field">
                <span className="admin-label">Merchandising</span>
                <AdminToggle
                  checked={values.isFeatured}
                  onChange={(v) => setValues((p) => ({ ...p, isFeatured: v }))}
                  labelOn="Featured brand"
                  labelOff="Regular brand"
                  hint="Featured brands get a highlighted spot on the brands page."
                />
              </div>
            )}
          </div>

          <div className="admin-actions">
            <button type="submit" className="admin-btn" disabled={busy}>
              {busy ? 'Saving…' : editingId ? `Save changes to ${values.name}` : `Add ${noun}`}
            </button>
            {editingId && (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={reset}>
                Cancel
              </button>
            )}
            <a href={isBrand ? '/brands' : '/categories'} className="admin-btn admin-btn--ghost">
              View storefront
            </a>
          </div>
        </AdminSection>
      </form>

      {/* ── LIST ── */}
      <AdminSection
        step={2}
        title={`All ${isBrand ? 'brands' : 'categories'}`}
        description={`${rows.length} total · ${totalProducts} product link(s). Deleting a ${noun.toLowerCase()} never deletes its products — they simply stop showing it.`}
      >
        {rows.length === 0 ? (
          <p className="admin-empty">Nothing here yet. Add one above.</p>
        ) : (
          <ul className="admin-taxonomy-list">
            {rows.map((row) => (
              <li key={row.id} className="admin-taxonomy-row">
                <div className="admin-taxonomy-main">
                  <span className="admin-taxonomy-name">{row.name}</span>
                  <span className="admin-taxonomy-slug">/{row.slug}</span>
                  {row.sub && <span className="admin-taxonomy-sub">{row.sub}</span>}
                </div>

                <div className="admin-taxonomy-meta">
                  <span className="admin-badge" data-status={row.isActive ? 'delivered' : 'cancelled'}>
                    {row.isActive ? 'live' : 'hidden'}
                  </span>
                  <span className="admin-order-meta">{row.productCount} product(s)</span>
                </div>

                <div className="admin-taxonomy-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => startEdit(row)}
                  >
                    Edit
                  </button>

                  {confirmId === row.id ? (
                    <>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        style={{ backgroundColor: '#8a1f1f', color: '#fff' }}
                        disabled={busy}
                        onClick={() => handleDelete(row)}
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => setConfirmId(null)}
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setConfirmId(row.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {confirmId === row.id && (
                  <p className="admin-hint" style={{ color: '#B42318', width: '100%' }}>
                    {row.productCount > 0
                      ? `${row.productCount} product is mein se dikh rahe the. Delete karne par wo product bach jayenge, lekin inka link hat jayega.`
                      : 'Is mein koi product nahi hai — delete karne se kuch nahi hoga.'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminSection>
    </>
  );
}
