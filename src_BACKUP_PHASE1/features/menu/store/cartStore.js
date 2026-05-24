import { create } from "zustand";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

const initialState = {

  items: [],

};

/**
 * =====================================================
 * STORE
 * =====================================================
 */

const useCartStore =
  create(

    (
      set,
      get
    ) => ({

      ...initialState,

      /**
       * =====================================================
       * ADD ITEM
       * =====================================================
       */

      addItem:
        (
          item
        ) => {

          const currentItems =
            get().items;

          set({

            items: [

              ...currentItems,

              {

                ...item,

                cartId:
                  crypto.randomUUID(),

              },

            ],

          });

        },

      /**
       * =====================================================
       * REMOVE ITEM
       * =====================================================
       */

      removeItem:
        (
          cartId
        ) => {

          set({

            items:
              get()
                .items
                .filter(

                  (
                    item
                  ) =>

                    item.cartId !==
                    cartId

                ),

          });

        },

      /**
       * =====================================================
       * CLEAR CART
       * =====================================================
       */

      clearCart:
        () => {

          set({

            items: [],

          });

        },

    })

  );

export default
  useCartStore;