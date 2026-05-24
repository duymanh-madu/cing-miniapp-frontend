import {
  create,
} from "zustand";

const useSecurityRuntimeStore =
  create(
    (
      set
    ) => ({

      securityEvents:
        [],

      activeThreats:
        [],

      runtimePolicies:
        {},

      auditGovernance:
        {},

      setRuntimePolicies:
        (
          runtimePolicies
        ) => {

          set({
            runtimePolicies,
          });

        },

      setAuditGovernance:
        (
          auditGovernance
        ) => {

          set({
            auditGovernance,
          });

        },

      appendSecurityEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              securityEvents: [

                payload,

                ...state.securityEvents,

              ].slice(
                0,
                300
              ),

            })
          );

        },

      setActiveThreats:
        (
          activeThreats
        ) => {

          set({
            activeThreats,
          });

        },

    })
  );

export default
  useSecurityRuntimeStore;