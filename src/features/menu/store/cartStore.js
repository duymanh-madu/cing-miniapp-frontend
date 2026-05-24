import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product) => {
    const items = get().items;
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      set({ items: items.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i) });
    } else {
      set({ items: [...items, { ...product, qty: 1, cartId: crypto.randomUUID() }] });
    }
  },

  increment: (id) => set({ items: get().items.map(i => i.id === id ? {...i, qty: i.qty + 1} : i) }),

  decrement: (id) => {
    const items = get().items;
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (item.qty <= 1) {
      set({ items: items.filter(i => i.id !== id) });
    } else {
      set({ items: items.map(i => i.id === id ? {...i, qty: i.qty - 1} : i) });
    }
  },

  removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
  clearCart: () => set({ items: [] }),

  get total() {
    return get().items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  },
  get count() {
    return get().items.reduce((s, i) => s + i.qty, 0);
  },
}));

export default useCartStore;
