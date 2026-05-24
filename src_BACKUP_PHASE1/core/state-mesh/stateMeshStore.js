import {
  create,
} from "zustand";

const useStateMeshStore =
  create(
    (
      set
    ) => ({

      distributedStates:
        {},

      reconciliationState:
        {},

      runtimeGraph:
        {},

      setDistributedState:
        (
          key,
          payload
        ) => {

          set(
            (
              state
            ) => ({

              distributedStates: {

                ...state.distributedStates,

                [key]:
                  payload,

              },

            })
          );

        },

      setReconciliationState:
        (
          reconciliationState
        ) => {

          set({
            reconciliationState,
          });

        },

      setRuntimeGraph:
        (
          runtimeGraph
        ) => {

          set({
            runtimeGraph,
          });

        },

    })
  );

export default
  useStateMeshStore;