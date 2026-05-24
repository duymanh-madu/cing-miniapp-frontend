import {
  create,
} from "zustand";

const useSessionReplayStore =
  create(
    (
      set
    ) => ({

      sessionEvents:
        [],

      replayMode:
        false,

      appendSessionEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              sessionEvents: [

                payload,

                ...state.sessionEvents,

              ].slice(
                0,
                1000
              ),

            })
          );

        },

      setReplayMode:
        (
          replayMode
        ) => {

          set({
            replayMode,
          });

        },

    })
  );

export default
  useSessionReplayStore;