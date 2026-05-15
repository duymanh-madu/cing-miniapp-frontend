import {
  create,
} from "zustand";

const useDeveloperPlatformStore =
  create(
    (
      set
    ) => ({

      developerApps:
        [],

      apiKeys:
        [],

      apiRateLimits:
        {},

      developerAnalytics:
        {},

      setDeveloperApps:
        (
          developerApps
        ) => {

          set({
            developerApps,
          });

        },

      setApiKeys:
        (
          apiKeys
        ) => {

          set({
            apiKeys,
          });

        },

      setApiRateLimits:
        (
          apiRateLimits
        ) => {

          set({
            apiRateLimits,
          });

        },

      setDeveloperAnalytics:
        (
          developerAnalytics
        ) => {

          set({
            developerAnalytics,
          });

        },

    })
  );

export default
  useDeveloperPlatformStore;