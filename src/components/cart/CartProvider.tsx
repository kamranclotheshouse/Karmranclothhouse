'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import {
  addToCart,
  cartCount,
  cartSubtotal,
  clearCart,
  getCartSnapshot,
  getServerCart,
  removeFromCart,
  setQuantity,
  subscribeCart,
  type CartItem,
} from '@/lib/cart';

interface CartApi {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  setQty: (slug: string, color: string, quantity: number) => void;
  remove: (slug: string, color: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCart);

  const api: CartApi = {
    items,
    count: cartCount(items),
    subtotal: cartSubtotal(items),
    add: addToCart,
    setQty: setQuantity,
    remove: removeFromCart,
    clear: clearCart,
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

/**
 * Never `undefined` — a component rendered outside the provider (an admin page,
 * say) gets a working no-op basket instead of a crash.
 */
export function useCart(): CartApi {
  const value = useContext(CartContext);
  if (value) return value;

  return {
    items: [],
    count: 0,
    subtotal: 0,
    add: () => {},
    setQty: () => {},
    remove: () => {},
    clear: () => {},
  };
}
