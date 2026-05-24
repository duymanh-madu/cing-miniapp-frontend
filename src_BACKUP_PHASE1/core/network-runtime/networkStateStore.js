import {
  create,
} from "zustand";

const useNetworkStateStore =
  create(
    (
      set
    ) => ({

      online:
        navigator.onLine,

      latency:
        null,

      reconnecting:
        false,

      setOnline:
        (
          online
        ) => {

          set({
            online,
          });

        },

      setLatency:
        (
          latency
        ) => {

          set({
            latency,
          });

        },

      setReconnecting:
        (
          reconnecting
        ) => {

          set({
            reconnecting,
          });

        },

    })
  );

export default
  useNetworkStateStore;