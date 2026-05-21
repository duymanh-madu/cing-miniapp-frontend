import { create }
from "zustand";

const useCartStore =
  create((set, get) => ({

    items: [],

    /**
     * =========================
     * ADD CART
     * =========================
     */

    addItem:
      (item) => {

        const current =
          get().items;

        set({

          items: [
            ...current,
            {
              ...item,
              cartId:
                crypto.randomUUID(),
            },
          ],

        });

      },

    /**
     * =========================
     * REMOVE
     * =========================
     */

    removeItem:
      (cartId) => {

        set({

          items:
            get().items.filter(
              (item) =>
                item.cartId !==
                cartId
            ),

        });

      },

    /**
     * =========================
     * CLEAR
     * =========================
     */

    clearCart:
      () =>
        set({
          items: [],
        }),

  }));

export default
  useCartStore;