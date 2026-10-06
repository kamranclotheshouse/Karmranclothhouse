/**
 * Orders data access — the only place that speaks SQL about `orders`.
 *
 * Server-only: never import from a "use client" file.
 *
 * The same table backs three callers: the public checkout (`POST /api/orders`),
 * the admin panel (list + status changes) and `/track` (public lookup by order
 * number). Validation lives here so all three agree on what is acceptable.
 */
import { query } from './driver';
import { PAKISTAN_CITIES, type NewOrderInput, type Order, type OrderStatus, type TrackedOrder } from '../orders';
import { getProductBySlug } from './catalogue';
import { getStoreSettings } from './settings';
import { getDeliveryFee } from '../settings';

/* ── Row shape (snake_case, straight off the wire) ───────────────────────── */

interface OrderRow {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  delivery_address: string;
  city: string;
  subtotal: string | number;
  delivery_charges: string | number;
  total_amount: string | number;
  payment_method: string;
  order_status: string;
  items: unknown;
  customer_notes: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const ORDER_COLUMNS = `
  order_number, customer_name, customer_phone, customer_whatsapp,
  delivery_address, city, subtotal, delivery_charges, total_amount,
  payment_method, order_status, items, customer_notes, created_at, updated_at
`;

/* ── Mappers ─────────────────────────────────────────────────────────────── */

const num = (value: string | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const str = (value: string | null | undefined): string | undefined =>
  value === null || value === undefined || value === '' ? undefined : value;

/** Neon returns an ISO string; PGlite may return a Date. Normalise both. */
const toIso = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

function toOrderItems(raw: unknown): Order['items'] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      slug: typeof item.slug === 'string' ? item.slug : '',
      title: typeof item.title === 'string' ? item.title : '',
      brand: typeof item.brand === 'string' ? item.brand : '',
      color: typeof item.color === 'string' ? item.color : '',
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      image: typeof item.image === 'string' ? item.image : '',
    };
  });
}

function toOrder(row: OrderRow): Order {
  return {
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAltPhone: str(row.customer_whatsapp),
    deliveryAddress: row.delivery_address,
    city: row.city,
    specialInstructions: str(row.customer_notes),
    subtotal: num(row.subtotal),
    deliveryCharges: num(row.delivery_charges),
    totalAmount: num(row.total_amount),
    paymentMethod: row.payment_method,
    status: row.order_status as OrderStatus,
    items: toOrderItems(row.items),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

/** Public tracking view — deliberately excludes name, phone and address. */
export function toTrackedOrder(order: Order): TrackedOrder {
  const { customerName, customerPhone, customerAltPhone, deliveryAddress, specialInstructions, updatedAt, ...rest } = order;
  void customerName;
  void customerPhone;
  void customerAltPhone;
  void deliveryAddress;
  void specialInstructions;
  void updatedAt;
  return rest;
}

/* ── Validation ──────────────────────────────────────────────────────────── */

export interface OrderValidationError {
  error: string;
  fields: Record<string, string>;
}

const ALLOWED_CITIES = new Set(PAKISTAN_CITIES);

const MAX_TOTAL = 500_000;
const MAX_ITEMS = 30;
const text = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Plain-language errors the checkout can show as-is. */
export function validateOrderInput(input: NewOrderInput): OrderValidationError | null {
  const fields: Record<string, string> = {};
  const name = text(input.customerName).trim();
  const phone = text(input.customerPhone).replace(/[-\s()]/g, '');
  const address = text(input.deliveryAddress).trim();
  const city = text(input.city).trim();

  if (name.length < 2) fields.customerName = 'Apna poora naam likhein, jaise Ali Khan.';
  else if (name.length > 150) fields.customerName = 'Naam 150 characters se chhota rakhein.';

  if (!/^03\d{9}$/.test(phone)) {
    fields.customerPhone = 'Number 03XXXXXXXXX ki tarah likhein, jaise 03001234567.';
  }

  if (address.length < 10) {
    fields.deliveryAddress = 'Mukammal address likhein — kam se kam 10 characters, jaise House 12, Street 4, Gulberg.';
  } else if (address.length > 500) {
    fields.deliveryAddress = 'Address 500 characters se chhota rakhein.';
  }

  if (!city) fields.city = 'Shehar choose karein.';
  else if (!ALLOWED_CITIES.has(city)) {
    fields.city = 'Sirf diye hue shehron mein se choose karein, jaise Peshawar.';
  }

  const alt = text(input.customerAltPhone).replace(/[-\s()]/g, '');
  if (alt && !/^03\d{9}$/.test(alt)) {
    fields.customerAltPhone = 'Doosra number bhi 03XXXXXXXXX ki tarah likhein.';
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    fields.items = 'Order mein kam se kam ek item hona chahiye.';
  } else if (input.items.length > MAX_ITEMS) {
    fields.items = `Ek order mein ${MAX_ITEMS} se zyada items nahi ho sakte.`;
  } else {
    input.items.forEach((item, i) => {
      if (!item || typeof item !== 'object') {
        fields[`items.${i}`] = `Item ${i + 1} ka data theek nahi hai.`;
        return;
      }
      if (!Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        fields[`items.${i}.quantity`] = `Item ${i + 1}: quantity 1 se 99 ke beech ho, jaise 2.`;
      }
      if (!text(item.slug).trim()) {
        fields[`items.${i}.slug`] = `Item ${i + 1} ka product missing hai.`;
      }
    });
  }

  if (Object.keys(fields).length > 0) {
    return {
      error: Object.values(fields)[0],
      fields,
    };
  }
  return null;
}

/**
 * The browser only identifies the requested products. Titles, prices, images,
 * delivery charges and totals are all rebuilt from the current server records
 * before an order is written.
 */
export async function prepareOrderInput(input: NewOrderInput): Promise<{
  input?: NewOrderInput;
  error?: OrderValidationError;
}> {
  const invalid = validateOrderInput(input);
  if (invalid) return { error: invalid };

  const fields: Record<string, string> = {};
  const requestedItems = input.items;
  const requestedQuantityBySlug = new Map<string, number>();
  for (const requested of requestedItems) {
    const slug = text(requested.slug).trim();
    requestedQuantityBySlug.set(slug, (requestedQuantityBySlug.get(slug) ?? 0) + requested.quantity);
  }
  const verifiedItems = await Promise.all(
    requestedItems.map(async (requested, index) => {
      const slug = text(requested.slug).trim();
      const product = await getProductBySlug(slug);
      if (!product) {
        fields[`items.${index}.slug`] = `Item ${index + 1} ab available nahi hai.`;
        return null;
      }
      if (!product.isInStock || product.stockQuantity < (requestedQuantityBySlug.get(slug) ?? 0)) {
        fields[`items.${index}.quantity`] = `${product.name} ki requested quantity ab available nahi hai.`;
        return null;
      }

      const requestedColor = text(requested.color).trim();
      const color = product.colors.find((entry) => entry.name === requestedColor);
      if (product.colors.length > 0 && (!color || !color.inStock)) {
        fields[`items.${index}.color`] = `${product.name} ka selected color ab available nahi hai.`;
        return null;
      }

      return {
        slug: product.slug,
        title: product.name,
        brand: product.brand,
        color: color?.name ?? '',
        quantity: requested.quantity,
        price: product.price,
        image: product.images[0] ?? '',
      };
    })
  );

  if (Object.keys(fields).length > 0) {
    return { error: { error: Object.values(fields)[0], fields } };
  }

  const items = verifiedItems.filter((item): item is Order['items'][number] => item !== null);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const settings = await getStoreSettings();
  const deliveryCharges = getDeliveryFee(settings, subtotal);

  if (subtotal + deliveryCharges > MAX_TOTAL) {
    return {
      error: {
        error: `Total Rs. ${MAX_TOTAL.toLocaleString()} se zyada nahi ho sakta.`,
        fields: { subtotal: `Total Rs. ${MAX_TOTAL.toLocaleString()} se zyada nahi ho sakta.` },
      },
    };
  }

  return {
    input: {
      customerName: text(input.customerName).trim(),
      customerPhone: text(input.customerPhone).replace(/[-\s()]/g, ''),
      customerAltPhone: text(input.customerAltPhone).replace(/[-\s()]/g, ''),
      deliveryAddress: text(input.deliveryAddress).trim(),
      city: text(input.city).trim(),
      specialInstructions: text(input.specialInstructions).trim(),
      subtotal,
      deliveryCharges,
      items,
    },
  };
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

export class OrderNotFoundError extends Error {
  constructor(orderNumber: string) {
    super(`No order ${orderNumber}`);
    this.name = 'OrderNotFoundError';
  }
}

const isUniqueViolation = (error: unknown): boolean => {
  const seen = new Set<unknown>();
  let cursor: unknown = error;
  for (let depth = 0; depth < 5 && cursor && !seen.has(cursor); depth++) {
    seen.add(cursor);
    const candidate = cursor as { code?: string; message?: string };
    if (candidate.code === '23505' || /duplicate key|unique constraint/i.test(candidate.message ?? '')) {
      return true;
    }
    cursor = (cursor as { sourceError?: unknown; cause?: unknown }).sourceError ??
      (cursor as { cause?: unknown }).cause;
  }
  return false;
};

/**
 * Allocates `KCH-1001`, `KCH-1002`, … from a sequence so two customers ordering
 * at the same moment cannot collide. A collision (the sequence starting behind
 * numbers someone already wrote by hand) simply tries the next one.
 */
export async function createOrder(input: NewOrderInput): Promise<Order> {
  const items = input.items.map((item) => ({
    slug: item.slug,
    title: item.title,
    brand: item.brand,
    color: item.color,
    quantity: Number(item.quantity),
    price: Number(item.price),
    image: item.image,
  }));
  const subtotal = Number(input.subtotal);
  const deliveryCharges = Number(input.deliveryCharges);

  const sql = `
    INSERT INTO orders (
      order_number, customer_name, customer_phone, customer_whatsapp,
      delivery_address, city, customer_notes,
      subtotal, delivery_charges, total_amount, order_status, items
    )
    SELECT format('KCH-%s', nextval('order_number_seq')),
           $1, $2, NULLIF($3, ''),
           $4, $5, NULLIF($6, ''),
           $7::numeric, $8::numeric, $7::numeric + $8::numeric, 'pending', $9::jsonb
    RETURNING ${ORDER_COLUMNS}
  `;
  const params = [
    input.customerName.trim(),
    input.customerPhone.replace(/[-\s()]/g, ''),
    (input.customerAltPhone ?? '').replace(/[-\s()]/g, ''),
    input.deliveryAddress.trim(),
    input.city.trim(),
    (input.specialInstructions ?? '').trim(),
    subtotal,
    deliveryCharges,
    JSON.stringify(items),
  ];

  for (let attempt = 0; ; attempt++) {
    try {
      const rows = await query<OrderRow>(sql, params);
      if (rows.length === 0) throw new Error('Order insert returned no row.');
      return toOrder(rows[0]);
    } catch (error) {
      if (attempt >= 4 || !isUniqueViolation(error)) throw error;
    }
  }
}

export interface ListOrdersOptions {
  status?: OrderStatus | 'all';
  search?: string;
  limit?: number;
}

export async function listOrders(options: ListOrdersOptions = {}): Promise<Order[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (options.status && options.status !== 'all') {
    params.push(options.status);
    clauses.push(`order_status = $${params.length}`);
  }

  const search = (options.search ?? '').trim();
  if (search) {
    params.push(`%${search.toLowerCase().replace(/^kch-?/, 'kch-')}%`);
    clauses.push(`(
      LOWER(order_number) LIKE $${params.length} OR
      LOWER(customer_name) LIKE $${params.length} OR
      regexp_replace(customer_phone, '\\D', '', 'g') LIKE regexp_replace($${params.length}, '\\D', '', 'g')
    )`);
  }

  params.push(Math.min(Math.max(options.limit ?? 200, 1), 500));
  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length}`,
    params
  );
  return rows.map(toOrder);
}

export async function getOrder(orderNumber: string): Promise<Order | null> {
  const rows = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE order_number = $1`,
    [normaliseOrderNumber(orderNumber)]
  );
  return rows.length > 0 ? toOrder(rows[0]) : null;
}

/** Public tracking requires the order number and the customer's phone number. */
export async function getOrderForTracking(orderNumber: string, phone: string): Promise<Order | null> {
  const normalisedPhone = phone.replace(/[-\s()]/g, '');
  if (!/^03\d{9}$/.test(normalisedPhone)) return null;

  const rows = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS}
       FROM orders
      WHERE order_number = $1
        AND (
          regexp_replace(customer_phone, '\\D', '', 'g') = $2
          OR regexp_replace(COALESCE(customer_whatsapp, ''), '\\D', '', 'g') = $2
        )`,
    [normaliseOrderNumber(orderNumber), normalisedPhone]
  );
  return rows.length > 0 ? toOrder(rows[0]) : null;
}

/** Accepts `kch1042`, `KCH 1042` and `KCH-1042` alike. */
export function normaliseOrderNumber(value: string): string {
  const bare = value.trim().toUpperCase().replace(/^KCH-?/, '').replace(/[^0-9]/g, '');
  return bare ? `KCH-${bare}` : value.trim().toUpperCase();
}

export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus
): Promise<Order> {
  const rows = await query<OrderRow>(
    `UPDATE orders
        SET order_status = $2,
            updated_at   = NOW()
      WHERE order_number = $1
      RETURNING ${ORDER_COLUMNS}`,
    [normaliseOrderNumber(orderNumber), status]
  );
  if (rows.length === 0) throw new OrderNotFoundError(orderNumber);
  return toOrder(rows[0]);
}
