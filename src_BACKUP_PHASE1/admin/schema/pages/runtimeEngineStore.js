import {
  create,
} from "zustand";

const useRuntimeEngineStore =
  create(
    (
      set
    ) => ({

      deployedRuntime:
        null,

      runtimeEvents:
        [],

      setDeployedRuntime:
        (
          deployedRuntime
        ) => {

          set({
            deployedRuntime,
          });

        },

      appendRuntimeEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              runtimeEvents: [

                payload,

                ...state.runtimeEvents,

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
  useRuntimeEngineStore;