import {
  create,
} from "zustand";

const usePaymentStore =
  create(
    (
      set
    ) => ({

      paymentMetrics:
        {},

      realtimePayments:
        [],

      setPaymentMetrics:
        (
          paymentMetrics
        ) => {

          set({
            paymentMetrics,
          });

        },

      appendRealtimePayment:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimePayments: [

                payload,

                ...state.realtimePayments,

              ].slice(
                0,
                100
              ),

            })
          );

        },

    })
  );

export default
  usePaymentStore;