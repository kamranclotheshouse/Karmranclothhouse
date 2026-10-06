import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/settings';

export async function generateMetadata(): Promise<Metadata> {
  const { address } = await getStoreSettings();
  return {
    title: 'Terms & Conditions | Kamran Cloth House — Saddar, Peshawar',
    description: `Terms of shopping at Kamran Cloth House — orders, payment, delivery, exchanges and authenticity. ${address}`,
  };
}

const sections = [
  {
    title: 'Overview',
    body: [
      'These terms apply when you shop with Kamran Cloth House through this website, WhatsApp or our Saddar, Peshawar store. By placing an order you agree to them. If anything is unclear, ask us before ordering — we are happy to explain.',
    ],
  },
  {
    title: 'Orders & Availability',
    body: [
      'An order is confirmed only after we verify stock and colour availability and confirm it with you on WhatsApp or phone. Fabric is sold in the quantity confirmed — stock moves fast in the shop, so a product on the website does not guarantee physical availability until confirmation.',
      'We reserve the right to cancel an order if the fabric is out of stock or a pricing error occurred, with a full explanation and no charge (delivery is Cash on Delivery anyway).',
    ],
  },
  {
    title: 'Pricing',
    body: [
      'All prices are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise. Prices may change without notice; the price confirmed with you at order time is the price you pay.',
      'Delivery charges are shown on the Delivery Policy page and confirmed before dispatch.',
    ],
  },
  {
    title: 'Payment',
    body: [
      'Payment is Cash on Delivery — you pay the courier when the parcel arrives. There is no advance payment and no card payment on this website. Open the parcel and inspect the fabric before handing over cash.',
    ],
  },
  {
    title: 'Delivery',
    body: [
      'We dispatch nationwide via registered couriers (TCS, Leopards, PostEx or similar). Timelines, charges and the inspection-before-payment process are described in our Delivery Policy.',
    ],
  },
  {
    title: 'Exchanges & Returns',
    body: [
      'You may exchange any fabric within 7 days of delivery if it is unused, in original condition, with the parcel and order details. Wrong item or defect? We cover the return courier charge. Full rules live on the Returns & Exchanges page.',
    ],
  },
  {
    title: 'Authenticity & Product Descriptions',
    body: [
      'We guarantee that every fabric piece is 100% original and sourced from the stated mill or brand. Colours on screen may differ slightly from the real shade — request a live photo on WhatsApp if the exact shade matters.',
      'Fabric measurements are as supplied by the mill; minor variations within standard industry tolerance do not constitute a defect.',
    ],
  },
  {
    title: 'Website Content & Intellectual Property',
    body: [
      'The website design, text, photographs and logos belong to Kamran Cloth House or their respective brand owners. You may view and share links for personal shopping; reproducing content for commercial use requires our written permission.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the extent permitted by law, our liability for any claim related to an order is limited to the value of that order. We are not responsible for courier delays outside our control, or for fabric altered, washed or cut after delivery.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These terms are governed by the laws of Pakistan. Any dispute is subject to the jurisdiction of the courts of Peshawar, Khyber Pakhtunkhwa.',
    ],
  },
  {
    title: 'Changes to These Terms',
    body: [
      'We may update these terms from time to time. The version published on this page at the time of your order applies to that order.',
    ],
  },
];

export default async function TermsPage() {
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
              Shopping With Us
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            Terms &amp; Conditions
          </h1>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            The straightforward rules for ordering, paying, delivery and exchanges at Kamran Cloth House.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
              Contact Us
            </a>
            <Link
              href="/privacy"
              className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
              style={{ backgroundColor: '#0E3B2C' }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
