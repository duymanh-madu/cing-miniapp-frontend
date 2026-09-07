import { create } from "zustand";

const CART_KEY = "cing_cart_session_v2";
const LEGACY_CART_KEY = "cing_cart_session";

function loadCart() {
  try {
    /*
     * V1 stored human-readable modifier slugs and client prices.
     * Those values cannot be migrated into financial ITEM-* IDs
     * safely, so the old session is intentionally invalidated.
     */
    sessionStorage.removeItem(
      LEGACY_CART_KEY
    );

    const raw =
      sessionStorage.getItem(
        CART_KEY
      );

    const parsed =
      raw
        ? JSON.parse(raw)
        : [];

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch(e) {
    return [];
  }
}

function saveCart(items) {
  try { sessionStorage.setItem(CART_KEY, JSON.stringify(items)); } catch(e) {}
}

function getCartKey(product) {
  const productId =
    String(
      product.store_item_id ||
      product.item_id ||
      product.id ||
      ""
    ).trim();

  const optionIds =
    Array.isArray(
      product.customization_option_ids
    )
      ? [
          ...product
            .customization_option_ids,
        ]
          .map(
            value =>
              String(
                value
              ).trim()
          )
          .filter(Boolean)
          .sort()
      : [];

  return JSON.stringify({
    item_id:
      productId,
    customization_option_ids:
      optionIds,
    note:
      String(
        product.note || ""
      ).trim(),
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
