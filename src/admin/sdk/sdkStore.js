import {
  create,
} from "zustand";

const useSdkStore =
  create(
    (
      set
    ) => ({

      sdkVersions:
        [],

      sdkRuntime:
        {},

      developerApps:
        [],

      sdkMetrics:
        {},

      setSdkVersions:
        (
          sdkVersions
        ) => {

          set({
            sdkVersions,
          });

        },

      setSdkRuntime:
        (
          sdkRuntime
        ) => {

          set({
            sdkRuntime,
          });

        },

      setDeveloperApps:
        (
          developerApps
        ) => {

          set({
            developerApps,
          });

        },

      setSdkMetrics:
        (
          sdkMetrics
        ) => {

          set({
            sdkMetrics,
          });

        },

    })
  );

export default
  useSdkStore;