'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminField,
  AdminInput,
  AdminSection,
  AdminTextarea,
  AdminToggle,
  notify,
} from '@/components/admin/ui';
import type { StoreSettings } from '@/lib/settings';
import { CloudinaryUploader } from '@/components/admin/CloudinaryUploader';
import {
  hasSettingsErrors,
  validateSettings,
  type SettingsErrors,
  type SettingsFormValues,
} from '@/lib/admin/validate-settings';

/** Server numbers/booleans arrive as editable strings while the form is open. */
function toFormValues(settings: StoreSettings): SettingsFormValues {
  return {
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    address: settings.address,
    mapUrl: settings.mapUrl,
    phone: settings.phone,
    landline: settings.landline,
    whatsappNumber: settings.whatsappNumber,
    email: settings.email,
    storeHours: settings.storeHours,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    tiktokUrl: settings.tiktokUrl,
    deliveryCharge: String(settings.deliveryCharge),
    freeDeliveryThreshold: String(settings.freeDeliveryThreshold),
    announcementEnabled: settings.announcementEnabled,
    announcementText: settings.announcementText,
    metaPixelId: settings.metaPixelId,
    tiktokPixelId: settings.tiktokPixelId,
  };
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsFormValues>(() => toFormValues(settings));
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof SettingsFormValues, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const fieldErrors = validateSettings(values);
    if (hasSettingsErrors(fieldErrors)) {
      setErrors(fieldErrors);
      notify('Kuch fields theek nahi hain — neeche dekhein.', 'error');
      return;
    }

    setErrors({});
    setBusy(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        notify(data.error ?? 'Save nahi ho saka.', 'error');
        return;
      }

      notify('Settings save ho gayi — storefront pe live hain.');
      setValues(toFormValues(data.settings));
      router.refresh();
    } catch {
      notify('Network problem — kuch save nahi hua.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="admin-heading">Store settings</h1>
      <p className="admin-subheading">
        Dukan ka naam, contact details, delivery charges aur announcement bar — ye sab storefront
        ke har page pe istemal hote hain.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <AdminSection
          step={1}
          title="Store identity"
          description="Ye naam aur address footer, contact page aur WhatsApp messages me jate hain."
        >
          <div className="admin-grid">
            <AdminField
              label="Store name"
              required
              hint="Website header, footer aur invoices pe dikhta hai."
              error={errors.storeName}
            >
              <AdminInput
                value={values.storeName}
                onChange={(e) => set('storeName', e.target.value)}
                placeholder="Kamran Cloth House"
                aria-invalid={Boolean(errors.storeName)}
              />
            </AdminField>

            <AdminField
              label="Store hours"
              hint="Footer me 🕐 ke saath dikhta hai, jaise 'Mon–Sat: 11am–9pm'."
              error={errors.storeHours}
            >
              <AdminInput
                value={values.storeHours}
                onChange={(e) => set('storeHours', e.target.value)}
                placeholder="Mon–Sat: 11am–9pm · Friday: 4pm–9pm"
              />
            </AdminField>
          </div>

          <AdminField
            label="Full address"
            required
            hint="Delivery policy page aur footer dono me jata hai."
            error={errors.address}
          >
            <AdminTextarea
              rows={2}
              value={values.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Shop # 14-16, Ground Floor, Shafi Market, Saddar Road, Peshawar, KP, Pakistan"
              aria-invalid={Boolean(errors.address)}
            />
          </AdminField>

          <div className="admin-grid">
            <AdminField
              label="Logo photo"
              hint="Header/footer mein chhote size (48px unchai) par lagta hai — 600 × 200 px transparent PNG banayein taake text safed/green dono background par saaf dikhe. Khali chhod dein to default /kamran_logo.png use hogi."
              error={errors.logoUrl}
            >
              <CloudinaryUploader
                single
                images={values.logoUrl && values.logoUrl !== '/kamran_logo.png' ? [values.logoUrl] : []}
                onChange={(next) => set('logoUrl', next[0] ?? '')}
                hint="Transparent PNG — 600 × 200 px, max 2 MB"
                emptyHint="Abhi custom logo nahi — default kamran_logo.png chal raha hai."
                ariaLabel="Upload store logo"
              />
            </AdminField>

            <AdminField
              label="Google Maps link"
              hint="Footer ke 'Google Maps' button ka link. Khali chhod dein to Peshawar default chalega."
              error={errors.mapUrl}
            >
              <AdminInput
                value={values.mapUrl}
                onChange={(e) => set('mapUrl', e.target.value)}
                placeholder="https://maps.google.com/…"
                aria-invalid={Boolean(errors.mapUrl)}
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection
          step={2}
          title="Contact numbers"
          description="In numbers par customers call aur WhatsApp karte hain — country code ke saath likhein."
        >
          <div className="admin-grid">
            <AdminField
              label="WhatsApp number"
              hint="Sirf digits, country code ke saath, '+' ke bagair — jaise 923001234567."
              error={errors.whatsappNumber}
            >
              <AdminInput
                inputMode="numeric"
                value={values.whatsappNumber}
                onChange={(e) => set('whatsappNumber', e.target.value)}
                placeholder="923001234567"
                aria-invalid={Boolean(errors.whatsappNumber)}
              />
            </AdminField>

            <AdminField
              label="Mobile number"
              hint="Footer me dikhta hai. Jaise +92 300 000 0000."
              error={errors.phone}
            >
              <AdminInput
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+92 300 000 0000"
                aria-invalid={Boolean(errors.phone)}
              />
            </AdminField>

            <AdminField
              label="Landline"
              hint="Shop ka landline number. Khali chhod dein to footer me is line ko chhupa diya jayega."
              error={errors.landline}
            >
              <AdminInput
                value={values.landline}
                onChange={(e) => set('landline', e.target.value)}
                placeholder="+92 91 5270000"
                aria-invalid={Boolean(errors.landline)}
              />
            </AdminField>

            <AdminField
              label="Email"
              hint="Order confirmations aur queries ke liye. Format: naam@domain.com"
              error={errors.email}
            >
              <AdminInput
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="info@kamrancloth.pk"
                aria-invalid={Boolean(errors.email)}
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection
          step={3}
          title="Delivery charges"
          description="Checkout drawer isi hisab se delivery fee calculate karta hai."
        >
          <div className="admin-grid">
            <AdminField
              label="Free delivery above (Rs)"
              hint="Is amount ya usse zyada ke order par delivery free. Jaise 15000."
              error={errors.freeDeliveryThreshold}
            >
              <AdminInput
                type="number"
                min={0}
                value={values.freeDeliveryThreshold}
                onChange={(e) => set('freeDeliveryThreshold', e.target.value)}
                placeholder="15000"
                aria-invalid={Boolean(errors.freeDeliveryThreshold)}
              />
            </AdminField>

            <AdminField
              label="Flat delivery charge (Rs)"
              hint="Free delivery limit se kam order par lagta hai. Jaise 250."
              error={errors.deliveryCharge}
            >
              <AdminInput
                type="number"
                min={0}
                value={values.deliveryCharge}
                onChange={(e) => set('deliveryCharge', e.target.value)}
                placeholder="250"
                aria-invalid={Boolean(errors.deliveryCharge)}
              />
            </AdminField>
          </div>

          <p className="admin-hint">
            Abhi: {Number(values.freeDeliveryThreshold) >= Number(values.deliveryCharge) ? (
              <>
                <strong>Rs {Number(values.freeDeliveryThreshold).toLocaleString()}</strong> se upar
                free, warna <strong>Rs {Number(values.deliveryCharge)}</strong> flat.
              </>
            ) : (
              <>Free delivery limit flat charge se kam hai — isay zyada rakhein.</>
            )}
          </p>
        </AdminSection>

        <AdminSection
          step={4}
          title="Announcement bar"
          description="Header ke upar wali chhoti strip. Band karein to strip bilkul nahi dikhegi."
        >
          <div className="admin-field">
            <span className="admin-label">Strip</span>
            <AdminToggle
              checked={values.announcementEnabled}
              onChange={(v) => set('announcementEnabled', v)}
              labelOn="Announcement showing"
              labelOff="Announcement hidden"
              hint={
                values.announcementEnabled
                  ? 'Website ke har page ke top par dikhegi.'
                  : 'Customers ko ye strip nahi dikhegi.'
              }
            />
          </div>

          <AdminField
            label="Announcement text"
            required={values.announcementEnabled}
            hint="Ek chhota line — sale, free delivery ya timing. Uppercase me dikhta hai."
            error={errors.announcementText}
            note={
              <p className="admin-hint" style={{ marginTop: 4 }}>
                {values.announcementText.length}/160 characters
              </p>
            }
          >
            <AdminTextarea
              rows={2}
              value={values.announcementText}
              onChange={(e) => set('announcementText', e.target.value)}
            placeholder="Free delivery on orders above Rs 15,000 · Cash on Delivery across Pakistan"
              maxLength={160}
              aria-invalid={Boolean(errors.announcementText)}
            />
          </AdminField>
        </AdminSection>

        <AdminSection
          step={5}
          title="Social links"
          description="Footer me inke icons tabhi clickable honge jab poora link diya ho — warna naam bina link ke dikhta hai."
        >
          <div className="admin-grid">
            <AdminField label="Instagram" hint="Jaise https://instagram.com/kamrancloth" error={errors.instagramUrl}>
              <AdminInput
                value={values.instagramUrl}
                onChange={(e) => set('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/…"
                aria-invalid={Boolean(errors.instagramUrl)}
              />
            </AdminField>

            <AdminField label="Facebook" hint="Jaise https://facebook.com/kamrancloth" error={errors.facebookUrl}>
              <AdminInput
                value={values.facebookUrl}
                onChange={(e) => set('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/…"
                aria-invalid={Boolean(errors.facebookUrl)}
              />
            </AdminField>

            <AdminField label="TikTok" hint="Jaise https://tiktok.com/@kamrancloth" error={errors.tiktokUrl}>
              <AdminInput
                value={values.tiktokUrl}
                onChange={(e) => set('tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@…"
                aria-invalid={Boolean(errors.tiktokUrl)}
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection
          step={6}
          title="Tracking pixels"
          description="Meta aur TikTok pixel IDs — advertising chalu karne par hi bharein. Khali rehne se koi tracking nahi hoti."
        >
          <div className="admin-grid">
            <AdminField label="Meta Pixel ID" hint="Facebook/Instagram ads ke liye. Sirf number." error={errors.metaPixelId}>
              <AdminInput
                value={values.metaPixelId}
                onChange={(e) => set('metaPixelId', e.target.value)}
                placeholder="1234567890"
              />
            </AdminField>

            <AdminField label="TikTok Pixel ID" hint="TikTok ads ke liye." error={errors.tiktokPixelId}>
              <AdminInput
                value={values.tiktokPixelId}
                onChange={(e) => set('tiktokPixelId', e.target.value)}
                placeholder="CQXXXXXXXXXXXXXXXX"
              />
            </AdminField>
          </div>
        </AdminSection>

        <div className="admin-actions">
          <button type="submit" className="admin-btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </button>
          <a href="/" className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
            View storefront
          </a>
        </div>
      </form>
    </>
  );
}
