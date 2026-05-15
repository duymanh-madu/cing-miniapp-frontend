import {
  create,
} from "zustand";

const useOfflineRuntimeStore =
  create(
    (
      set
    ) => ({

      offlineQueue:
        [],

      syncState:
        {},

      cacheState:
        {},

      pendingActions:
        [],

      setOfflineQueue:
        (
          offlineQueue
        ) => {

          set({
            offlineQueue,
          });

        },

      setSyncState:
        (
          syncState
        ) => {

          set({
            syncState,
          });

        },

      setCacheState:
        (
          cacheState
        ) => {

          set({
            cacheState,
          });

        },

      appendPendingAction:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              pendingActions: [

                payload,

                ...state.pendingActions,

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
  useOfflineRuntimeStore;