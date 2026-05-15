import {
  create,
} from "zustand";

const useEventFeedStore =
  create(
    (
      set
    ) => ({

      events:
        [],

      append:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              events: [

                payload,

                ...state.events,

              ].slice(
                0,
                200
              ),

            })
          );

        },

    })
  );

export default
  useEventFeedStore;