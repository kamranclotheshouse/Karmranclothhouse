import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import PixelLoader from "@/components/analytics/PixelLoader";
import { CartProvider } from "@/components/cart/CartProvider";
import { getStoreSettings } from "@/lib/db/settings";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kamrancloth.pk'
  ),
  title: "Kamran Cloth House | Premium Men's Fabric — Saddar, Peshawar",
  description:
    "Explore the finest unstitched fabric, dulha designs & branded collections at Kamran Cloth House, Shafi Market, Saddar, Peshawar. Cash on Delivery across Pakistan.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kamran Cloth House',
    title: "Kamran Cloth House | Premium Men's Fabric — Saddar, Peshawar",
    description:
      "Explore the finest unstitched fabric, dulha designs & branded collections at Kamran Cloth House, Shafi Market, Saddar, Peshawar. Cash on Delivery across Pakistan.",
    images: [
      {
        url: '/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Kamran Cloth House — fabric store, Saddar Peshawar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kamran Cloth House | Premium Men's Fabric — Saddar, Peshawar",
    description:
      "Unstitched fabric, dulha designs & branded collections — Cash on Delivery across Pakistan.",
    images: ['/images/hero.jpg'],
  },
};

/** schema.org ClothingStore — gives Google the shop's identity, address and socials. */
function storeJsonLd(settings: Awaited<ReturnType<typeof getStoreSettings>>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kamrancloth.pk';
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();

  return (
    <html lang="en" className={`h-full ${playfair.variable} ${outfit.variable}`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(storeJsonLd(settings)).replace(/</g, '\\u003c'),
          }}
        />
        <CartProvider>
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
      </body>
    </html>
  );
}
