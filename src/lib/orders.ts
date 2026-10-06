/**
 * Order types — shared by the checkout form, the admin panel and the database
 * layer. No I/O lives here: creating and reading orders is `@/lib/db/orders`
 * (server) or `POST /api/orders` (browser).
 */

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'dispatched',
  'delivered',
  'cancelled',
];

/**
 * Cities the checkout offers. One list, used by the form's dropdown *and* by
 * `validateOrderInput` — a city can never be pickable yet rejected.
 */
export const PAKISTAN_CITIES = [
  'Peshawar', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad',
  'Quetta', 'Multan', 'Gujranwala', 'Hyderabad', 'Sialkot', 'Abbottabad',
  'Mardan', 'Swat', 'Nowshera', 'Charsadda', 'Kohat', 'Bannu', 'Dera Ismail Khan',
  'Mansehra', 'Haripur', 'Attock', 'Swabi', 'Bahawalpur', 'Sargodha',
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
