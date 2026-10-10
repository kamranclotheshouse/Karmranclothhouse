/**
 * Order types — shared by the checkout form, the admin panel and the database
 * layer. No I/O lives here: creating and reading orders is `@/lib/db/orders`
 * (server) or `POST /api/orders` (browser).
 */

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'returned' | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'dispatched',
  'delivered',
  'returned',
  'cancelled',
];

/**
 * Cities the checkout offers. One list, used by the form's dropdown *and* by
 * `validateOrderInput` — a city can never be pickable yet rejected.
 */
export const PAKISTAN_CITIES = [
  // Islamabad Capital Territory, Punjab and AJK
  'Islamabad', 'Rawalpindi', 'Lahore', 'Faisalabad', 'Gujranwala', 'Multan',
  'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Jhang', 'Sheikhupura',
  'Gujrat', 'Rahim Yar Khan', 'Dera Ghazi Khan', 'Wah Cantt', 'Taxila',
  'Attock', 'Chakwal', 'Mianwali', 'Khushab', 'Bhakkar', 'Layyah', 'Muzaffargarh',
  'Lodhran', 'Khanewal', 'Vehari', 'Pakpattan', 'Okara', 'Kasur', 'Nankana Sahib',
  'Hafizabad', 'Mandi Bahauddin', 'Narowal', 'Murree', 'Jhelum', 'Gujar Khan',
  'Kotli', 'Mirpur', 'Muzaffarabad', 'Rawalakot', 'Bagh',

  // Khyber Pakhtunkhwa
  'Peshawar', 'Mardan', 'Swat', 'Mingora', 'Nowshera', 'Charsadda', 'Kohat',
  'Bannu', 'Dera Ismail Khan', 'Abbottabad', 'Mansehra', 'Haripur', 'Swabi',
  'Chitral', 'Lower Dir', 'Upper Dir', 'Timergara', 'Bajaur', 'Khar',
  'Mohmand', 'Khyber', 'Jamrud', 'Karak', 'Hangu', 'Tank', 'Lakki Marwat',
  'Torghar', 'Battagram', 'Buner', 'Shangla', 'Malakand', 'Waziristan',

  // Sindh
  'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Shaheed Benazirabad',
  'Mirpur Khas', 'Thatta', 'Badin', 'Dadu', 'Jacobabad', 'Shikarpur', 'Khairpur',
  'Ghotki', 'Kashmore', 'Tando Adam', 'Tando Allahyar', 'Umerkot', 'Matiari',
  'Sanghar', 'Jamshoro',

  // Balochistan
  'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman', 'Sibi', 'Zhob', 'Loralai',
  'Dera Bugti', 'Naseerabad', 'Jaffarabad', 'Kalat', 'Mastung', 'Pishin',
  'Killa Abdullah', 'Killa Saifullah', 'Lasbela', 'Awaran', 'Panjgur', 'Kharan',
  'Nushki', 'Washuk',

  // Gilgit-Baltistan
  'Gilgit', 'Skardu', 'Hunza', 'Nagar', 'Ghizer', 'Astore', 'Diamer', 'Chilas',
  'Ghanche', 'Shigar', 'Kharmang',
];

export interface OrderItem {
  slug: string;
  title: string;
  brand: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  deliveryAddress: string;
  city: string;
  specialInstructions?: string;
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/** What the checkout form sends. Totals are recomputed server-side. */
export interface NewOrderInput {
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  deliveryAddress: string;
  city: string;
  specialInstructions?: string;
  subtotal: number;
  deliveryCharges: number;
  items: OrderItem[];
}

/**
 * What `/track` may reveal to anyone who guesses an order number: the things a
 * customer needs to recognise their order, and nothing that identifies them.
 */
export interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  paymentMethod: string;
  courierName?: string;
  trackingNumber?: string;
  city: string;
  items: OrderItem[];
  createdAt: string;
}

/** Best-effort deep links for the couriers commonly used in Pakistan. */
export function getCourierTrackingUrl(courierName: string | undefined, trackingNumber: string | undefined): string | null {
  const courier = courierName?.trim().toLowerCase() ?? '';
  const tracking = trackingNumber?.trim();
  if (!courier || !tracking) return null;
  const encoded = encodeURIComponent(tracking);
  if (courier.includes('leopard')) return `https://www.leopardscourier.com/tracking?cn=${encoded}`;
  if (courier.includes('postex')) return `https://postex.pk/tracking?tracking_number=${encoded}`;
  if (courier.includes('trax')) return `https://trax.pk/tracking?tracking_number=${encoded}`;
  if (courier.includes('tcs')) return `https://www.tcsexpress.com/track/${encoded}`;
  if (courier.includes('m&p') || courier.includes('m&p')) return `https://www.mulphilog.com/track-shipment/?cn=${encoded}`;
  return null;
}
