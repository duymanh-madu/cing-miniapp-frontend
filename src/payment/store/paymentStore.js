import { create }
  from "zustand";

export const usePaymentStore =
  create((set) => ({

    paymentStatus:
      "idle",

    transactionId:
      null,

    retryCount:
      0,

    setPaymentStatus(status) {

      set({

        paymentStatus:
          status,

      });

    },

    setTransactionId(id) {

      set({

        transactionId:
          id,

      });

    },

    incrementRetry() {

      set((state) => ({

        retryCount:
          state.retryCount + 1,

      }));

    },

  }));