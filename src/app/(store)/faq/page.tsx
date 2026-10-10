import type { Metadata } from 'next';
import Link from 'next/link';
import { getStoreSettings } from '@/lib/db/settings';

export async function generateMetadata(): Promise<Metadata> {
  const { address } = await getStoreSettings();
  return {
    title: 'FAQs | Kamran Cloth House — Saddar, Peshawar',
    description: `Answers about ordering, cash on delivery, delivery times, exchanges and fabric authenticity at Kamran Cloth House. ${address}`,
  };
}

const faqs = [
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes — we deliver across Pakistan with Cash on Delivery. There is no advance payment. The final payable amount is shown before dispatch and is paid to the courier on delivery.',
  },
  {
    q: 'How do I place an order?',
    a: 'Tap Order Now on a product, fill in your delivery details and submit the COD order. You can also send the product name or screenshot, quantity and city on WhatsApp. Our team confirms stock before dispatch.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We normally prepare confirmed orders within 1–2 working days. Courier transit is usually 2–5 working days, depending on your city and route. Tracking is shared after dispatch.',
  },
  {
    q: 'Can I check the fabric before paying?',
    a: 'Please check the parcel packaging when it arrives. If it is damaged, incorrect or has an obvious issue, contact us immediately with your order number and photos before using the fabric. Courier inspection rules can vary by route.',
  },
  {
    q: 'Is the fabric 100% original?',
    a: 'Products are sourced from the brand or supplier named on the product page. If you need confirmation for a particular roll or colour, ask us on WhatsApp before ordering.',
  },
  {
    q: 'Will the colour match the photos on the website?',
    a: 'Screens can show colours differently from real fabric. Ask us for a current photo or shade confirmation in natural light before placing the order if the exact colour is important.',
  },
  {
    q: 'What if I want to exchange or return something?',
    a: 'Exchange requests must be raised within 7 days of delivery. The fabric must be unused, uncut, unwashed and in its original condition. Approval and courier responsibility depend on the reason; see the Returns & Exchanges page.',
  },
  {
    q: 'Do you offer tailoring?',
    a: 'Yes — our in-house master tailors stitch bespoke suits to your measurements. Visit the Tailoring page for styles, pricing and the measurement process.',
  },
  {
    q: 'What are the delivery charges?',
    a: 'Free delivery on orders of Rs. %FREE% and above; a flat courier fee of Rs. %FLAT% applies below that. You pay the courier only when the parcel arrives — see the Delivery Policy page for details.',
  },
  {
    q: 'Where is your store and what are the timings?',
    a: 'We are located at Shafi Market, Saddar, Peshawar. Visit us during store hours — call or WhatsApp before coming if you want a specific fabric held aside.',
  },
];

export default async function FaqPage() {
  const settings = await getStoreSettings();
  const freeDelivery = settings.freeDeliveryThreshold.toLocaleString();
  const flat = settings.deliveryCharge;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a.replace('%FREE%', freeDelivery).replace('%FLAT%', String(flat)),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
        }}
      />
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
              Customer Support
            </p>
            <span className="h-px w-8" style={{ backgroundColor: '#C9A227' }} />
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-4xl md:text-5xl text-white mb-4 leading-tight drop-shadow-md"
          >
            Frequently Asked Questions
          </h1>

          <p className="max-w-xl mx-auto text-sm leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Ordering, delivery, exchanges and authenticity — everything you need to know before you order.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-4 mb-12">
            {faqs.map((faq) => {
              const answer = faq.a
                .replace('%FREE%', freeDelivery)
                .replace('%FLAT%', String(flat));
              return (
                <details
                  key={faq.q}
                  className="group border border-line bg-white shadow-sm hover:border-[#C9A227] transition-colors"
                >
                  <summary
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 text-base font-semibold text-ink"
                  >
                    <span>{faq.q}</span>
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs transition-transform group-open:rotate-45"
                      style={{ backgroundColor: '#0E3B2C' }}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-600 border-t border-line pt-4">
                    {answer}
                  </p>
                </details>
              );
            })}
          </div>

          <div
            className="p-8 border shadow-sm text-center"
            style={{ backgroundColor: 'var(--color-cream)', borderColor: 'var(--color-border)' }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl text-ink font-semibold mb-2">
              Still have a question?
            </h2>
            <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
              Our Saddar boutique replies within 30 minutes during shop hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
                style={{ backgroundColor: '#0E7C6E' }}
              >
                Ask on WhatsApp
              </a>
              <Link
                href="/how-to-order"
                className="px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold text-white transition-all text-center shadow-md"
                style={{ backgroundColor: '#0E3B2C' }}
              >
                How to Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
