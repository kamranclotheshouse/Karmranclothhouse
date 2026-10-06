import type { Metadata } from 'next';
import ContactClient from '@/components/contact/ContactClient';
import { getStoreSettings } from '@/lib/db/settings';

/** Cached for a minute — the address in the header comes from the database. */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { storeName, address } = await getStoreSettings();
  return {
    title: 'Contact & Store Visit | Kamran Cloth House',
    description: `Visit ${storeName} at ${address} — retail orders, custom wedding fabrics and nationwide Cash on Delivery.`,
  };
}

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return <ContactClient settings={settings} />;
}
