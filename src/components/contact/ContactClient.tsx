'use client';

import { useState } from 'react';
import type { StoreSettings } from '@/lib/settings';

type FormState = {
  name: string;
  phone: string;
  city: string;
  fabricInterest: string;
  message: string;
};

const EMPTY: FormState = {
  name: '',
  phone: '',
  city: '',
  fabricInterest: 'General Inquiry',
  message: '',
};

const INTEREST_OPTIONS = [
  'General Inquiry',
  'Dulha Wedding Wear',
  'Winter Karandi & Wool',
  'Egyptian & Pima Cotton',
  'Bespoke Stitching',
];

/**
 * The inquiry has nowhere to email to — the shop runs on WhatsApp — so submit
 * opens a pre-filled chat with the store. Nothing is silently discarded.
 */
export default function ContactClient({ settings }: { settings: StoreSettings }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [failed, setFailed] = useState(false);

  const whatsapp = settings.whatsappNumber;
  const landline = settings.landline.trim();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const lines = [
      `السلام علیکم، میں ${settings.storeName} سے رابطہ کرنا چاہتا ہوں۔`,
      '',
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `City: ${formData.city}`,
      `Interested in: ${formData.fabricInterest}`,
    ];
    if (formData.message.trim()) lines.push(`Message: ${formData.message.trim()}`);

    const romanUrduLines = [
      `Assalam-o-Alaikum, mujhe ${settings.storeName} se rabta karna hai.`,
      '',
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `City: ${formData.city}`,
      `Interested in: ${formData.fabricInterest}`,
      ...(formData.message.trim() ? [`Message: ${formData.message.trim()}`] : []),
    ];
    void lines;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(romanUrduLines.join('\n'))}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');

    if (!opened) {
      // Popup blocked — hand the link to the visitor instead of losing the form.
      setFailed(true);
      return;
    }

    setFailed(false);
    setFormSubmitted(true);
  };

  return (
    <>
      {/* Header */}
      <section
        style={{ backgroundColor: 'var(--color-cream)', borderBottom: '1px solid var(--color-border)' }}
        className="py-20 text-center"
      >
        <p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--color-gold-text)' }}>
          {settings.address}
        </p>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-4xl md:text-5xl tracking-wide mb-6 text-ink"
        >
          Contact & Store Visit
        </h1>
        <p className="max-w-xl mx-auto text-sm leading-relaxed px-4" style={{ color: 'var(--color-fg-muted)' }}>
          We welcome your inquiries for retail orders, custom wedding fabrics, master tailoring, and nationwide delivery.
        </p>
      </section>

      {/* Main Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Contact Info */}
            <div>
              <p className="text-xs tracking-[0.35em] uppercase mb-3 font-semibold" style={{ color: 'var(--color-gold-text)' }}>
                Store Location
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl tracking-wide text-ink mb-8"
              >
                {settings.storeName}
              </h2>

              <div className="space-y-6 text-sm mb-10" style={{ color: 'var(--color-fg-muted)' }}>
                <div className="flex items-start gap-4">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-semibold text-ink uppercase tracking-wider text-xs mb-1">Address</p>
                    <p>{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-semibold text-ink uppercase tracking-wider text-xs mb-1">Phone & WhatsApp</p>
                    <p className="font-mono text-base font-medium text-ink">
                      {landline ? `${settings.phone} / ${landline}` : settings.phone}
                    </p>
                    {settings.storeHours.trim() && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>{settings.storeHours}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-xl">🕒</span>
                  <div>
                    <p className="font-semibold text-ink uppercase tracking-wider text-xs mb-1">Store Timings</p>
                    <p>{settings.storeHours || 'Call to confirm timings'}</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA Button */}
              <div className="pt-6 border-t border-line">
                <p className="text-xs uppercase tracking-wider text-muted mb-3">Prefer Instant Chat?</p>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `السلام علیکم، میں ${settings.storeName} سے رابطہ کرنا چاہتا ہوں۔`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] transition-colors font-semibold uppercase text-xs tracking-widest shadow-md"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right: Inquiry Form */}
            <div className="bg-cream p-8 sm:p-10 border border-line">
              <h3
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-2xl tracking-wide text-ink mb-2"
              >
                Send Us An Inquiry
              </h3>
              <p className="text-xs text-muted mb-8">
                Fill this quick form and your message opens in WhatsApp, ready to send to our Saddar store team.
              </p>

              {formSubmitted ? (
                <div className="p-8 bg-cream border border-line text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <h4 className="font-semibold text-ink uppercase tracking-wide text-sm mb-1">
                    Message ready!
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                    WhatsApp khul gaya hai — wahan Send dabayein. Hamari team jawab degi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(EMPTY);
                      setFormSubmitted(false);
                    }}
                    className="mt-4 text-[11px] uppercase tracking-widest underline text-muted"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmad Khan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-line text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-2">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0300-1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-line text-sm text-ink focus:outline-none focus:border-brand font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Peshawar, Islamabad"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-line text-sm text-ink focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-2">
                      Fabric of Interest
                    </label>
                    <select
                      value={formData.fabricInterest}
                      onChange={(e) => setFormData({ ...formData, fabricInterest: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-line text-sm text-ink focus:outline-none focus:border-brand"
                    >
                      {INTEREST_OPTIONS.map((option, index) => (
                        <option key={option} value={option}>
                          {index === 0 ? 'General Fabric Inquiry' : option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-semibold mb-2">
                      Your Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Details about fabric length, color, or special requirement..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-line text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>

                  {failed && (
                    <p className="text-xs text-red-700 border border-red-200 bg-red-50 p-3">
                      Browser ne WhatsApp window block kar di. Neeche diye gaye button se direct
                      chat khol lein.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-brand text-white hover:bg-brand-soft transition-colors uppercase text-xs tracking-[0.25em] font-semibold shadow-md"
                  >
                    Send on WhatsApp
                  </button>

                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-[11px] uppercase tracking-widest text-muted underline"
                  >
                    ya direct WhatsApp kholein
                  </a>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Store Map */}
      {settings.mapUrl.trim() && (
        <section style={{ backgroundColor: 'var(--color-cream)' }} className="py-20 border-t border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: 'var(--color-gold-text)' }}>
                Shafi Market · Saddar · Peshawar
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl tracking-wide text-ink"
              >
                Find Our Store
              </h2>
            </div>

            <div
              className="overflow-hidden border shadow-sm"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <iframe
                src={settings.mapUrl.trim()}
                title={`Map — ${settings.storeName}, ${settings.address}`}
                width="100%"
                height="450"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="text-center mt-6">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all shadow-md"
                style={{ backgroundColor: '#0E3B2C' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
