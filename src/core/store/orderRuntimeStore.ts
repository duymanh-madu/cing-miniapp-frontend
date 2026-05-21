import { create } from "zustand";

interface OrderRuntimeState {

  activeOrderId:
    string | null;

  orderStatus:
    string | null;

  pendingOrders:
    number;

  setOrderState: (
    payload: {

      activeOrderId:
        string | null;

      orderStatus:
        string | null;

      pendingOrders:
        number;

    }
  ) => void;

}

export const useOrderRuntimeStore =
  create<OrderRuntimeState>(

    (
      set
    ) => ({

      activeOrderId:
        null,

      orderStatus:
        null,

      pendingOrders:
        0,

      setOrderState: (
        payload
      ) => set({

        activeOrderId:
          payload.activeOrderId,

        orderStatus:
          payload.orderStatus,

        pendingOrders:
          payload.pendingOrders,

      }),

    })

  );