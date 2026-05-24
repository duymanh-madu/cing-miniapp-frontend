import {
  create,
} from "zustand";

const useDeliveryRetryStore =
  create(
    (
      set
    ) => ({

      failedDeliveries:
        [],

      retryQueue:
        [],

      setFailedDeliveries:
        (
          failedDeliveries
        ) => {

          set({
            failedDeliveries,
          });

        },

      setRetryQueue:
        (
          retryQueue
        ) => {

          set({
            retryQueue,
          });

        },

    })
  );

export default
  useDeliveryRetryStore;