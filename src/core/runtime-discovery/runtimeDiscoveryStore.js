import {
  create,
} from "zustand";

const useRuntimeDiscoveryStore =
  create(
    (
      set
    ) => ({

      discoveredRuntimes:
        [],

      discoveryGraph:
        {},

      runtimeMetadata:
        {},

      setDiscoveredRuntimes:
        (
          discoveredRuntimes
        ) => {

          set({
            discoveredRuntimes,
          });

        },

      setDiscoveryGraph:
        (
          discoveryGraph
        ) => {

          set({
            discoveryGraph,
          });

        },

      setRuntimeMetadata:
        (
          runtimeMetadata
        ) => {

          set({
            runtimeMetadata,
          });

        },

    })
  );

export default
  useRuntimeDiscoveryStore;