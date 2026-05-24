import {
  create,
} from "zustand";

const useEcosystemStore =
  create(
    (
      set
    ) => ({

      ecosystemApps:
        [],

      federationRuntime:
        {},

      ecosystemMetrics:
        {},

      activeExtensions:
        [],

      initialized:
        false,

      loading:
        false,

      setEcosystemApps:
        (
          ecosystemApps
        ) => {

          set({
            ecosystemApps,
          });

        },

      setFederationRuntime:
        (
          federationRuntime
        ) => {

          set({
            federationRuntime,
          });

        },

      setEcosystemMetrics:
        (
          ecosystemMetrics
        ) => {

          set({
            ecosystemMetrics,
          });

        },

      setActiveExtensions:
        (
          activeExtensions
        ) => {

          set({
            activeExtensions,
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
  useEcosystemStore;