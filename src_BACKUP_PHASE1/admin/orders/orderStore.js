import {
  create,
} from "zustand";

const useOrderStore =
  create(
    (
      set
    ) => ({

      realtimeOrders:
        [],

      activeOrders:
        [],

      orderMetrics:
        {},

      selectedOrder:
        null,

      initialized:
        false,

      loading:
        false,

      setRealtimeOrders:
        (
          realtimeOrders
        ) => {

          set({
            realtimeOrders,
          });

        },

      appendRealtimeOrder:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeOrders: [

                payload,

                ...state.realtimeOrders,

              ].slice(
                0,
                200
              ),

            })
          );

        },

      setActiveOrders:
        (
          activeOrders
        ) => {

          set({
            activeOrders,
          });

        },

      setOrderMetrics:
        (
          orderMetrics
        ) => {

          set({
            orderMetrics,
          });

        },

      setSelectedOrder:
        (
          selectedOrder
        ) => {

          set({
            selectedOrder,
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
  useOrderStore;