import {
  create,
} from "zustand";

const useOrchestrationRuntimeStore =
  create(
    (
      set
    ) => ({

      activeFlows:
        [],

      executionTimeline:
        [],

      orchestrationMetrics:
        {},

      appendExecution:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              executionTimeline: [

                payload,

                ...state.executionTimeline,

              ].slice(
                0,
                200
              ),

            })
          );

        },

      setActiveFlows:
        (
          activeFlows
        ) => {

          set({
            activeFlows,
          });

        },

      setOrchestrationMetrics:
        (
          orchestrationMetrics
        ) => {

          set({
            orchestrationMetrics,
          });

        },

    })
  );

export default
  useOrchestrationRuntimeStore;