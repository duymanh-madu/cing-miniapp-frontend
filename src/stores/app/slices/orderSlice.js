export const createOrderSlice =
  (set) => ({

    activeOrders: [],

    setOrders(orders) {

      set({

        activeOrders:
          orders,

      });

    },

  });