import {
  create,
} from "zustand";

const useFederationStore =
  create(
    (
      set
    ) => ({

      federatedApps:
        [],

      federationHealth:
        {},

      runtimeModules:
        [],

      crossAppEvents:
        [],

      setFederatedApps:
        (
          federatedApps
        ) => {

          set({
            federatedApps,
          });

        },

      setFederationHealth:
        (
          federationHealth
        ) => {

          set({
            federationHealth,
          });

        },

      setRuntimeModules:
        (
          runtimeModules
        ) => {

          set({
            runtimeModules,
          });

        },

      appendCrossAppEvent:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              crossAppEvents: [

                payload,

                ...state.crossAppEvents,

              ].slice(
                0,
                100
              ),

            })
          );

        },

    })
  );

export default
  useFederationStore;