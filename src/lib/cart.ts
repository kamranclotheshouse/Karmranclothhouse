/**
 * The visitor's shopping basket.
 *
 * Client-only by nature — nobody is signed in, so the basket belongs to the
 * browser. Persisted to localStorage and exposed through `useSyncExternalStore`
 * so the server render and the first client render always agree (both return
 * `EMPTY_CART`); the real contents appear as soon as React takes over.
 *
 * Only import this from a "use client" file.
 */

export interface CartItem {
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  color: string;
  quantity: number;
}

export const EMPTY_CART: CartItem[] = [];

const STORAGE_KEY = 'kch_cart_v1';

let snapshot: CartItem[] = EMPTY_CART;
let loaded = false;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function sanitise(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return EMPTY_CART;

  const items: CartItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.slug !== 'string' || !row.slug) continue;

    const quantity = Number(row.quantity);
    const price = Number(row.price);

    items.push({
      slug: row.slug,
      name: typeof row.name === 'string' ? row.name : row.slug,
      brand: typeof row.brand === 'string' ? row.brand : '',
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      image: typeof row.image === 'string' ? row.image : '',
      color: typeof row.color === 'string' ? row.color : '',
      quantity: Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 99) : 1,
    });
  }
  return items;
}

function load(): void {
  if (loaded || !isBrowser()) return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? sanitise(JSON.parse(raw)) : EMPTY_CART;
  } catch {
    snapshot = EMPTY_CART;
  }
}

function commit(next: CartItem[]): void {
  snapshot = next;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode / quota exceeded — the basket still works for this session.
    }
  }
  listeners.forEach((fn) => fn());
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Client value. Use `getServerCart` as the `getServerSnapshot` argument. */
export function getCartSnapshot(): CartItem[] {
  load();
  return snapshot;
}

/** Always empty — guarantees hydration matches the server render. */
export function getServerCart(): CartItem[] {
  return EMPTY_CART;
}

/** Same slug in a different colour is a different line. */
const sameLine = (item: CartItem, slug: string, color: string) =>
  item.slug === slug && item.color === color;

export function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
  const quantity = Math.min(Math.max(item.quantity ?? 1, 1), 99);
  const current = getCartSnapshot();
  const existing = current.find((entry) => sameLine(entry, item.slug, item.color));

  if (existing) {
    commit(
      current.map((entry) =>
        sameLine(entry, item.slug, item.color)
          ? { ...entry, quantity: Math.min(entry.quantity + quantity, 99) }
          : entry
      )
    );
    return;
  }

  commit([...current, { ...item, quantity }]);
}

export function setQuantity(slug: string, color: string, quantity: number): void {
  const next = Math.min(Math.max(quantity, 1), 99);
  commit(
    getCartSnapshot().map((entry) =>
      sameLine(entry, slug, color) ? { ...entry, quantity: next } : entry
    )
  );
}

export function removeFromCart(slug: string, color: string): void {
  commit(getCartSnapshot().filter((entry) => !sameLine(entry, slug, color)));
}

export function clearCart(): void {
  commit(EMPTY_CART);
}

export const cartCount = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0);

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);
