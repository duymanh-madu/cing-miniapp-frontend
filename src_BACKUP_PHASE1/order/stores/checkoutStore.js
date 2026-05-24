import {
  create,
} from "zustand";

/**
 * =====================================================
 * CHECKOUT STORE
 * =====================================================
 */

const useCheckoutStore =
  create(
    (
      set
    ) => ({

      customerName:
        "",

      phone:
        "",

      address:
        "",

      note:
        "",

      paymentMethod:
        "COD",

      setField:
        (
          field,
          value
        ) => {

          set({

            [field]:
              value,

          });

        },

    })
  );

export default
  useCheckoutStore;