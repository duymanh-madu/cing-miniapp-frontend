import {
  create,
} from "zustand";

const useRuntimeDeltaStateStore =
  create(
    (
      set
    ) => ({

      deltaHistory:
        [],

      latestDelta:
        null,

      appendDelta:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              deltaHistory: [

                payload,

                ...state.deltaHistory,

              ].slice(
                0,
                300
              ),

              latestDelta:
                payload,

            })
          );

        },

    })
  );

export default
  useRuntimeDeltaStateStore;