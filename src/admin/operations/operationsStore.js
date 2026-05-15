import {
  create,
} from "zustand";

const useOperationsStore =
  create(
    (
      set
    ) => ({

      operationalEvents:
        [],

      operationalMetrics:
        {},

      setOperationalEvents:
        (
          operationalEvents
        ) => {

          set({
            operationalEvents,
          });

        },

      appendOperationalEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              operationalEvents: [

                payload,

                ...state.operationalEvents,

              ].slice(
                0,
                200
              ),

            })
          );

        },

      setOperationalMetrics:
        (
          operationalMetrics
        ) => {

          set({
            operationalMetrics,
          });

        },

    })
  );

export default
  useOperationsStore;