import {
  create,
} from "zustand";

const useRuntimeFabricStore =
  create(
    (
      set
    ) => ({

      runtimeNodes:
        [],

      runtimeEdges:
        [],

      activeZones:
        [],

      runtimeTopology:
        {},

      setRuntimeNodes:
        (
          runtimeNodes
        ) => {

          set({
            runtimeNodes,
          });

        },

      setRuntimeEdges:
        (
          runtimeEdges
        ) => {

          set({
            runtimeEdges,
          });

        },

      setActiveZones:
        (
          activeZones
        ) => {

          set({
            activeZones,
          });

        },

      setRuntimeTopology:
        (
          runtimeTopology
        ) => {

          set({
            runtimeTopology,
          });

        },

    })
  );

export default
  useRuntimeFabricStore;