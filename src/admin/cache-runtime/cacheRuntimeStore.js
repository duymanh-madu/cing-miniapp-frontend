import {
  create,
} from "zustand";

const useCacheRuntimeStore =
  create(
    (
      set
    ) => ({

      edgeCaches:
        [],

      cacheInvalidations:
        [],

      cacheHitMetrics:
        {},

      distributedCacheRuntime:
        {},

      setEdgeCaches:
        (
          edgeCaches
        ) => {

          set({
            edgeCaches,
          });

        },

      setCacheInvalidations:
        (
          cacheInvalidations
        ) => {

          set({
            cacheInvalidations,
          });

        },

      setCacheHitMetrics:
        (
          cacheHitMetrics
        ) => {

          set({
            cacheHitMetrics,
          });

        },

      setDistributedCacheRuntime:
        (
          distributedCacheRuntime
        ) => {

          set({
            distributedCacheRuntime,
          });

        },

    })
  );

export default
  useCacheRuntimeStore;