import { create }
  from "zustand";

export const useOrderExperienceStore =
  create((set) => ({

    activeOrder: null,

    orderHistory: [],

    paymentPending: false,

    setActiveOrder(order) {

      set({

        activeOrder:
          order,

      });

    },

    setOrderHistory(history) {

      set({

        orderHistory:
          history,

      });

    },

    setPaymentPending(value) {

      set({

        paymentPending:
          value,

      });

    },

  }));