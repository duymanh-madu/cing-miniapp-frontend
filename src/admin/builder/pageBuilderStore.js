import {
  create,
} from "zustand";

const usePageBuilderStore =
  create(
    (
      set
    ) => ({

      pages:
        [],

      selectedPage:
        null,

      visualNodes:
        [],

      visualEdges:
        [],

      runtimePreview:
        null,

      initialized:
        false,

      loading:
        false,

      setPages:
        (
          pages
        ) => {

          set({
            pages,
          });

        },

      setSelectedPage:
        (
          selectedPage
        ) => {

          set({
            selectedPage,
          });

        },

      setVisualNodes:
        (
          visualNodes
        ) => {

          set({
            visualNodes,
          });

        },

      setVisualEdges:
        (
          visualEdges
        ) => {

          set({
            visualEdges,
          });

        },

      setRuntimePreview:
        (
          runtimePreview
        ) => {

          set({
            runtimePreview,
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
  usePageBuilderStore;