import {
  create,
} from "zustand";

const useAiOrchestrationStore =
  create(
    (
      set
    ) => ({

      orchestrationFlows:
        [],

      activeExecutions:
        [],

      orchestrationMetrics:
        {},

      setOrchestrationFlows:
        (
          orchestrationFlows
        ) => {

          set({
            orchestrationFlows,
          });

        },

      setActiveExecutions:
        (
          activeExecutions
        ) => {

          set({
            activeExecutions,
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
  useAiOrchestrationStore;