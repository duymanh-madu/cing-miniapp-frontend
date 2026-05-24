import {
  create,
} from "zustand";

/**
 * =====================================================
 * CALCULATE ITEM PRICE
 * =====================================================
 */

const calculateItemPrice =
  (
    item
  ) => {

    const basePrice =
      Number(
        item.price || 0
      );

    const toppingsPrice =
      (
        item.toppings || []
      ).reduce(
        (
          total,
          topping
        ) => {

          return (
            total +
            Number(
              topping.price || 0
            )
          );

        },
        0
      );

    return (
      basePrice +
      toppingsPrice
    );

  };

/**
 * =====================================================
 * CART STORE
 * =====================================================
 */

const useCartStore =
  create(
    (
      set,
      get
    ) => ({

      /**
       * =============================================
       * STATE
       * =============================================
       */

      items: [],

      isCartOpen:
        false,

      /**
       * =============================================
       * OPEN / CLOSE
       * =============================================
       */

      openCart:
        () => {

          set({

            isCartOpen:
              true,

          });

        },

      closeCart:
        () => {

          set({

            isCartOpen:
              false,

          });

        },

      /**
       * =============================================
       * ADD ITEM
       * =============================================
       */

      addItem:
        (
          item
        ) => {

          const finalPrice =
            calculateItemPrice(
              item
            );

          const cartItem = {

            ...item,

            quantity: 1,

            finalPrice,

          };

          set({

            items: [

              ...get().items,

              cartItem,

            ],

            isCartOpen:
              true,

          });

        },

      /**
       * =============================================
       * REMOVE ITEM
       * =============================================
       */

      removeItem:
        (
          index
        ) => {

          const updatedItems =
            [
              ...get().items,
            ];

          updatedItems.splice(
            index,
            1
          );

          set({

            items:
              updatedItems,

          });

        },

      /**
       * =============================================
       * INCREASE
       * =============================================
       */

      increaseQuantity:
        (
          index
        ) => {

          const updatedItems =
            [
              ...get().items,
            ];

          if (
            !updatedItems[index]
          ) {

            return;

          }

          updatedItems[
            index
          ].quantity += 1;

          set({

            items:
              updatedItems,

          });

        },

      /**
       * =============================================
       * DECREASE
       * =============================================
       */

      decreaseQuantity:
        (
          index
        ) => {

          const updatedItems =
            [
              ...get().items,
            ];

          if (
            !updatedItems[index]
          ) {

            return;

          }

          if (
            updatedItems[
              index
            ].quantity > 1
          ) {

            updatedItems[
              index
            ].quantity -= 1;

          } else {

            updatedItems.splice(
              index,
              1
            );

          }

          set({

            items:
              updatedItems,

          });

        },

      /**
       * =============================================
       * TOTAL PRICE
       * =============================================
       */

      getTotalPrice:
        () => {

          return get()
            .items
            .reduce(
              (
                total,
                item
              ) => {

                return (
                  total +

                  (
                    Number(
                      item.finalPrice || 0
                    ) *

                    Number(
                      item.quantity || 1
                    )
                  )

                );

              },
              0
            );

        },

      /**
       * =============================================
       * TOTAL ITEMS
       * =============================================
       */

      getTotalItems:
        () => {

          return get()
            .items
            .reduce(
              (
                total,
                item
              ) => {

                return (
                  total +
                  Number(
                    item.quantity || 0
                  )
                );

              },
              0
            );

        },

      /**
       * =============================================
       * CLEAR CART
       * =============================================
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