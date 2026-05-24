import {
  create,
} from "zustand";

const useRuntimeTimelineStore =
  create(
    (
      set
    ) => ({

      timelineEvents:
        [],

      replaySessions:
        [],

      appendTimelineEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              timelineEvents: [

                payload,

                ...state.timelineEvents,

              ].slice(
                0,
                500
              ),

            })
          );

        },

      setReplaySessions:
        (
          replaySessions
        ) => {

          set({
            replaySessions,
          });

        },

    })
  );

export default
  useRuntimeTimelineStore;