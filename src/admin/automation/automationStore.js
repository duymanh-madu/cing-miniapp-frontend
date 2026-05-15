import {
  create,
} from "zustand";

const useAutomationStore =
  create(
    (
      set
    ) => ({

      workflows:
        [],

      executions:
        [],

      automationMetrics:
        {},

      initialized:
        false,

      loading:
        false,

      setWorkflows:
        (
          workflows
        ) => {

          set({
            workflows,
          });

        },

      setExecutions:
        (
          executions
        ) => {

          set({
            executions,
          });

        },

      appendExecution:
        (
          execution
        ) => {

          set(
            (
              state
            ) => ({

              executions: [

                execution,

                ...state.executions,

              ].slice(
                0,
                100
              ),

            })
          );

        },

      setAutomationMetrics:
        (
          automationMetrics
        ) => {

          set({
            automationMetrics,
          });

        },

      setLoading:
        (
          loading
        ) => {

          set({
            loading,
          });

        },

    })
  );

export default
  useAutomationStore;