import {
  create,
} from "zustand";

const useDevopsStore =
  create(
    (
      set
    ) => ({

      deployments:
        [],

      activePipelines:
        [],

      auditLogs:
        [],

      setDeployments:
        (
          deployments
        ) => {

          set({
            deployments,
          });

        },

      setActivePipelines:
        (
          activePipelines
        ) => {

          set({
            activePipelines,
          });

        },

      appendAuditLog:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              auditLogs: [

                payload,

                ...state.auditLogs,

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
  useDevopsStore;