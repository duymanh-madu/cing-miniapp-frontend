import {
  create,
} from "zustand";

const usePerformanceStore =
  create(
    (
      set
    ) => ({

      runtimeMetrics:
        {},

      bundleMetrics:
        {},

      renderingMetrics:
        {},

      websocketMetrics:
        {},

      edgeCacheMetrics:
        {},

      setRuntimeMetrics:
        (
          runtimeMetrics
        ) => {

          set({
            runtimeMetrics,
          });

        },

      setBundleMetrics:
        (
          bundleMetrics
        ) => {

          set({
            bundleMetrics,
          });

        },

      setRenderingMetrics:
        (
          renderingMetrics
        ) => {

          set({
            renderingMetrics,
          });

        },

      setWebsocketMetrics:
        (
          websocketMetrics
        ) => {

          set({
            websocketMetrics,
          });

        },

      setEdgeCacheMetrics:
        (
          edgeCacheMetrics
        ) => {

          set({
            edgeCacheMetrics,
          });

        },

    })
  );

export default
  usePerformanceStore;