import {
  create,
} from "zustand";

const useRuntimeTopologyStore =
  create(
    (
      set
    ) => ({

      topologies:
        [],

      activeTopology:
        null,

      executionGraphs:
        [],

      setTopologies:
        (
          topologies
        ) => {

          set({
            topologies,
          });

        },

      setActiveTopology:
        (
          activeTopology
        ) => {

          set({
            activeTopology,
          });

        },

      setExecutionGraphs:
        (
          executionGraphs
        ) => {

          set({
            executionGraphs,
          });

        },

    })
  );

export default
  useRuntimeTopologyStore;