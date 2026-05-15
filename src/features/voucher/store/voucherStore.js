import {
  create,
} from "zustand";

const useVoucherStore =
  create(
    (set) => ({

      vouchers: [],

      setVouchers:
        (vouchers) => {

          set({
            vouchers,
          });

        },

      clear:
        () => {

          set({
            vouchers: [],
          });

        },

    })
  );

export default
  useVoucherStore;