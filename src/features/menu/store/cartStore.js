import { create } from "zustand";

const CART_KEY = "cing_cart_session";

function loadCart() {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveCart(items) {
  try { sessionStorage.setItem(CART_KEY, JSON.stringify(items)); } catch(e) {}
}

const useCartStore = create((set, get) => ({
  items: loadCart(),

  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.id === product.id);
    const next = existing
      ? items.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i)
      : [...items, { ...product, qty: 1, cartId: crypto.randomUUID() }];
    saveCart(next);
    set({ items: next });
  },

  increment: (id) => {
    const next = get().items.map(i => i.id === id ? {...i, qty: i.qty + 1} : i);
    saveCart(next); set({ items: next });
  },

  decrement: (id) => {
    const items = get().items;
    const item = items.find(i => i.id === id);
    if (!item) return;
    const next = item.qty <= 1
      ? items.filter(i => i.id !== id)
      : items.map(i => i.id === id ? {...i, qty: i.qty - 1} : i);
    saveCart(next); set({ items: next });
  },

  removeItem: (id) => {
    const next = get().items.filter(i => i.id !== id);
    saveCart(next); set({ items: next });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  get total() {
    return get().items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  },
  get count() {
    return get().items.reduce((s, i) => s + i.qty, 0);
  },
}));

export default useCartStore;
