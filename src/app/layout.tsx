import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import NavigationLoader from '@/components/layout/NavigationLoader';

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${playfair.variable} ${outfit.variable}`}>
      <body className="min-h-full flex flex-col">
        <NavigationLoader />
        {children}
      </body>
    </html>
  );
}
