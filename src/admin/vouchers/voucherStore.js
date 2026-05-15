import {
  create,
} from "zustand";

const useVoucherStore =
  create(
    (
      set
    ) => ({

      vouchers:
        [],

      voucherMetrics:
        {},

      initialized:
        false,

      loading:
        false,

      setVouchers:
        (
          vouchers
        ) => {

          set({
            vouchers,
          });

        },

      setVoucherMetrics:
        (
          voucherMetrics
        ) => {

          set({
            voucherMetrics,
          });

        },

      setLoading:
        (
          loading
        ) => {

          set({
            loading,
          });

        },

    })
  );

export default
  useVoucherStore;