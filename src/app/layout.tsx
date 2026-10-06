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
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();

  return (
    <html lang="en" className={`h-full ${playfair.variable} ${outfit.variable}`}>
      <body className="min-h-full flex flex-col">
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
