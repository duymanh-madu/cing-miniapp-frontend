import {
  create,
} from "zustand";

const useMicrofrontendStore =
  create(
    (
      set
    ) => ({

      federatedBundles:
        [],

      remoteApps:
        [],

      runtimeFederation:
        {},

      bundleOptimization:
        {},

      setFederatedBundles:
        (
          federatedBundles
        ) => {

          set({
            federatedBundles,
          });

        },

      setRemoteApps:
        (
          remoteApps
        ) => {

          set({
            remoteApps,
          });

        },

      setRuntimeFederation:
        (
          runtimeFederation
        ) => {

          set({
            runtimeFederation,
          });

        },

      setBundleOptimization:
        (
          bundleOptimization
        ) => {

          set({
            bundleOptimization,
          });

        },

    })
  );

export default
  useMicrofrontendStore;