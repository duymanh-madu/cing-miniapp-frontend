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

function getCartKey(product) {
  const toppingIds = Array.isArray(product.toppings)
    ? product.toppings.map(t => t.id || t.label || t.name || String(t)).sort()
    : [];

  return JSON.stringify({
    id: product.id,
    price: product.price || 0,
    options: product.options || {},
    toppings: toppingIds,
    note: String(product.note || "").trim(),
  });
}

function matchesCartLine(item, keyOrId) {
  return item.cartId === keyOrId || (!item.cartId && item.id === keyOrId);
}

const useCartStore = create((set, get) => ({
  items: loadCart(),

  addItem: (product) => {
    const items = get().items;
    const qtyToAdd = Math.max(1, Number(product.qty || 1));
    const cartKey = getCartKey(product);
    const existing = items.find(i => i.cartKey === cartKey);

    const next = existing
      ? items.map(i => i.cartKey === cartKey ? {...i, qty: i.qty + qtyToAdd} : i)
      : [...items, { ...product, qty: qtyToAdd, cartKey, cartId: crypto.randomUUID() }];

    saveCart(next);
    set({ items: next });
  },

  increment: (cartId) => {
    const next = get().items.map(i => matchesCartLine(i, cartId) ? {...i, qty: i.qty + 1} : i);
    saveCart(next); set({ items: next });
  },

  decrement: (cartId) => {
    const items = get().items;
    const item = items.find(i => matchesCartLine(i, cartId));
    if (!item) return;
    const next = item.qty <= 1
      ? items.filter(i => !matchesCartLine(i, cartId))
      : items.map(i => matchesCartLine(i, cartId) ? {...i, qty: i.qty - 1} : i);
    saveCart(next); set({ items: next });
  },

  removeItem: (cartId) => {
    const next = get().items.filter(i => !matchesCartLine(i, cartId));
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
