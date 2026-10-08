import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import PixelLoader from '@/components/analytics/PixelLoader';
import { CartProvider } from '@/components/cart/CartProvider';
import { getStoreSettings } from '@/lib/db/settings';

/** schema.org ClothingStore — gives Google the shop's identity, address and socials. */
function storeJsonLd(settings: Awaited<ReturnType<typeof getStoreSettings>>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kamranclothhouse.pk';
  const sameAs = [
    settings.facebookUrl,
    settings.instagramUrl,
    settings.tiktokUrl,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: settings.storeName,
    description:
      "Men's unstitched fabric, dulha designs, winter collections, coat & waistcoat fabric and shawls in Saddar, Peshawar.",
    url: base,
    image: `${base}/images/hero.jpg`,
    logo: `${base}/kamran_logo.png`,
    telephone: settings.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: 'Peshawar',
      addressRegion: 'Khyber Pakhtunkhwa',
      addressCountry: 'PK',
    },
    sameAs,
    priceRange: 'PKR',
    paymentAccepted: 'Cash on Delivery',
    currenciesAccepted: 'PKR',
  };
}

/**
 * Storefront chrome — TopBar, Header, Footer, WhatsApp bubble, Store JSON-LD
 * and analytics pixels live ONLY inside this route group. Everything outside
 * it (i.e. /admin) renders bare, without the shop navigation around it.
 */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <CartProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeJsonLd(settings)).replace(/</g, '\\u003c'),
        }}
      />
      <TopBar settings={settings} />

      <Header settings={settings} />

      <main className="flex-1">{children}</main>

      <PixelLoader
        metaPixelId={settings.metaPixelId}
        tiktokPixelId={settings.tiktokPixelId}
      />

      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </CartProvider>
  );
}
