import {
  create,
} from "zustand";

const useSandboxStore =
  create(
    (
      set
    ) => ({

      sandboxApps:
        [],

      runtimeIsolation:
        {},

      sandboxExecutions:
        [],

      sandboxLogs:
        [],

      setSandboxApps:
        (
          sandboxApps
        ) => {

          set({
            sandboxApps,
          });

        },

      setRuntimeIsolation:
        (
          runtimeIsolation
        ) => {

          set({
            runtimeIsolation,
          });

        },

      setSandboxExecutions:
        (
          sandboxExecutions
        ) => {

          set({
            sandboxExecutions,
          });

        },

      setSandboxLogs:
        (
          sandboxLogs
        ) => {

          set({
            sandboxLogs,
          });

        },

    })
  );

export default
  useSandboxStore;