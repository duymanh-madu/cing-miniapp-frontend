import { create } from "zustand";

export const useOperationsStore =
  create((set) => ({

    liveOrders: [],

    alerts: [],

    kitchenQueue: [],

    deliveryQueue: [],

    addLiveOrder(order) {

      set((state) => ({

        liveOrders: [

          order,

          ...state.liveOrders,

        ].slice(0, 25),

      }));

    },

    updateKitchenQueue(queue) {

      set({

        kitchenQueue: queue,

      });

    },

    updateDeliveryQueue(queue) {

      set({

        deliveryQueue: queue,

      });

    },

    pushAlert(alert) {

      set((state) => ({

        alerts: [

          alert,

          ...state.alerts,

        ].slice(0, 20),

      }));

    },

  }));