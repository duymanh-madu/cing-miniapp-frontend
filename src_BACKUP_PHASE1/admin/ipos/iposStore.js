import {
  create,
} from "zustand";

const useIposStore =
  create(
    (
      set
    ) => ({

      connectionStatus:
        null,

      syncMetrics:
        {},

      realtimeSyncEvents:
        [],

      setConnectionStatus:
        (
          connectionStatus
        ) => {

          set({
            connectionStatus,
          });

        },

      setSyncMetrics:
        (
          syncMetrics
        ) => {

          set({
            syncMetrics,
          });

        },

      appendRealtimeSyncEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeSyncEvents: [

                payload,

                ...state.realtimeSyncEvents,

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
  useIposStore;