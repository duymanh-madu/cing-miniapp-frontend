import {
  create,
} from "zustand";

const useWorkflowBuilderStore =
  create(
    (
      set
    ) => ({

      nodes:
        [],

      edges:
        [],

      selectedNode:
        null,

      setNodes:
        (
          nodes
        ) => {

          set({
            nodes,
          });

        },

      setEdges:
        (
          edges
        ) => {

          set({
            edges,
          });

        },

      setSelectedNode:
        (
          selectedNode
        ) => {

          set({
            selectedNode,
          });

        },

    })
  );

export default
  useWorkflowBuilderStore;