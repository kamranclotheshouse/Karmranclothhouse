import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/settings';

export async function generateMetadata(): Promise<Metadata> {
  const { address } = await getStoreSettings();
  return {
    title: 'Privacy Policy | Kamran Cloth House — Saddar, Peshawar',
    description: `How Kamran Cloth House collects, uses and protects your personal information. ${address}`,
  };
}

const sections = [
  {
    title: 'What We Collect',
    body: [
      'When you place an order on WhatsApp or by phone, we collect only what we need to deliver it: your name, phone number, delivery address, and the details of what you ordered.',
      'Our website may record basic technical information such as the pages you visit and your device type. We do not collect or store payment card details — every order is Cash on Delivery.',
    ],
  },
  {
    title: 'How We Use It',
    body: [
      'To confirm and fulfil your order, hand it to the courier, answer your questions, and handle exchanges or returns.',
      'To send order updates (dispatch, tracking) on WhatsApp or by SMS. We do not send marketing messages without your permission.',
    ],
  },
  {
    title: 'Cookies & Local Storage',
    body: [
      'The site uses strictly necessary cookies and browser storage to keep your cart and session working. We do not use advertising cookies on this website.',
    ],
  },
  {
    title: 'Analytics Pixels',
    body: [
      'With your consent where required, we may load Meta (Facebook) and TikTok pixels to understand which ads bring visitors to the shop and to measure conversions. These platforms may set their own cookies. You can opt out using your browser settings or the ad platform’s ad controls.',
    ],
  },
  {
    title: 'Who We Share It With',
    body: [
      'Only your name, phone number and address are shared with our courier partners (TCS, Leopards, PostEx or similar) so they can deliver your parcel.',
      'We do not sell, rent or trade your personal information with anyone else.',
    ],
  },
  {
    title: 'How Long We Keep It',
    body: [
      'Order records are kept for as long as needed for delivery, exchanges, accounting and legal obligations. Enquiry messages on WhatsApp are kept only as long as our support threads exist on that device.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'You can ask us what information we hold about you, request a correction, or ask us to delete it where we are not legally required to keep it. Contact us using the details below and we will respond promptly.',
    ],
  },
];

export default async function PrivacyPage() {
  const settings = await getStoreSettings();

  return (
    <>
      {/* ── Page Header ── */}
      <section
        style={{
          backgroundColor: '#0E3B2C',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
        }}
        className="py-16 md:py-20 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
            <p className="text-[10px] tracking-[0.45em] uppercase font-semibold" style={{ color: '#C9A227' }}>
              Your Data, Your Trust
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            Privacy Policy
          </h1>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Plain words — what we collect, why, and what never happens to your data.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="p-8 mb-12 border shadow-sm"
            style={{ backgroundColor: 'var(--color-cream)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm leading-relaxed text-zinc-700">
              Kamran Cloth House (Shafi Market, Saddar, Peshawar) respects your privacy. This policy explains how
              we handle your information when you shop with us online, on WhatsApp, or in person. Last updated:
              October 2026.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title} className="pb-8 border-b border-line last:border-0 last:pb-0">
                <h2
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-xl md:text-2xl text-ink font-semibold mb-3"
                >
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.body.map((para) => (
                    <p key={para.slice(0, 40)} className="text-sm leading-relaxed text-zinc-600">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-line flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E7C6E' }}
            >
              Ask About Your Data
            </a>
            <Link
              href="/terms"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E3B2C' }}
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
