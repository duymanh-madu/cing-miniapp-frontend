import {
  create,
} from "zustand";

/**
 * =====================================================
 * REALTIME STORE
 * =====================================================
 */

const useRealtimeStore =
  create(
    (
      set
    ) => ({

      connected:
        false,

      setConnected:
        (
          connected
        ) => {

          set({

            connected,

          });

        },

    })
  );

export default
  useRealtimeStore;