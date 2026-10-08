/**
 * Client-side analytics helpers — Meta (fbq) + TikTok (ttq) pixel events.
 * Every call is a safe no-op when the pixels are not loaded (IDs empty,
 * ad blockers, SSR). Loaded by <PixelLoader /> from store_settings IDs.
 *
 * Event map (per ROADMAP R7):
 *   PageView    — every route (initial load + client navigation)
 *   ViewContent — PDP mount
 *   AddToCart   — customer adds an item to the basket
 *   InitiateCheckout — checkout drawer opens
 *   Purchase    — order accepted by /api/orders
 */

type PixelData = Record<string, unknown>;

type PixelWindow = Window & {
  fbq?: (command: string, event: string, data?: PixelData) => void;
  ttq?: {
    track?: (event: string, data?: PixelData) => void;
    page?: () => void;
  };
};

const PKR = 'PKR';

function pixelWindow(): PixelWindow | undefined {
  return typeof window === 'undefined' ? undefined : (window as PixelWindow);
}

function meta(event: string, data: PixelData): void {
  try {
    pixelWindow()?.fbq?.('track', event, data);
  } catch {
    /* blocked or not loaded */
  }
}

function tiktok(event: string, data: PixelData): void {
  try {
    pixelWindow()?.ttq?.track?.(event, data);
  } catch {
    /* blocked or not loaded */
  }
}

/** Fires on initial load and on every client-side route change. */
export function trackPageView(): void {
  try {
    const w = pixelWindow();
    w?.fbq?.('track', 'PageView');
    w?.ttq?.page?.();
  } catch {
    /* blocked or not loaded */
  }
}

/** PDP viewed. */
export function trackViewContent(product: {
  slug: string;
  name: string;
  price: number;
}): void {
  meta('ViewContent', {
    content_ids: [product.slug],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: PKR,
  });
  tiktok('ViewContent', {
    content_id: product.slug,
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: PKR,
  });
}

/** Customer added one or more items to the basket. */
export function trackAddToCart(
  items: { slug: string; name: string; price: number; quantity: number }[]
): void {
  if (items.length === 0) return;
  const value = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  meta('AddToCart', {
    content_ids: items.map((i) => i.slug),
    content_name: items[0].name,
    content_type: 'product',
    value,
    currency: PKR,
  });
  tiktok('AddToCart', {
    content_id: items[0].slug,
    content_name: items[0].name,
    content_type: 'product',
    quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    price: value,
    currency: PKR,
  });
}

/** Checkout drawer opened with at least one item. */
export function trackInitiateCheckout(
  items: { slug: string; name: string; price: number; quantity: number }[]
): void {
  if (items.length === 0) return;
  const value = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const contentIds = items.map((i) => i.slug);
  meta('InitiateCheckout', {
    content_ids: contentIds,
    content_name: items[0].name,
    content_type: 'product',
    value,
    currency: PKR,
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  });
  tiktok('InitiateCheckout', {
    contents: items.map((i) => ({
      content_id: i.slug,
      content_name: i.name,
      content_type: 'product',
      quantity: i.quantity,
      price: i.price,
    })),
    value,
    currency: PKR,
  });
}

/** Order accepted (COD confirmed). */
export function trackPurchase(order: {
  orderNumber: string;
  value: number;
  items: { slug: string; quantity: number; price: number }[];
}): void {
  meta('Purchase', {
    content_ids: order.items.map((i) => i.slug),
    content_type: 'product',
    value: order.value,
    currency: PKR,
    order_id: order.orderNumber,
    num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
  });
  tiktok('CompletePayment', {
    contents: order.items.map((i) => ({
      content_id: i.slug,
      content_type: 'product',
      quantity: i.quantity,
      price: i.price,
    })),
    value: order.value,
    currency: PKR,
    order_id: order.orderNumber,
  });
}
