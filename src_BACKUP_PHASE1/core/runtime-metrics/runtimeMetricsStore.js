import {
  create,
} from "zustand";

const useRuntimeMetricsStore =
  create(
    (
      set
    ) => ({

      fps:
        null,

      memoryUsage:
        null,

      websocketLatency:
        null,

      runtimeHealth:
        {},

      setFps:
        (
          fps
        ) => {

          set({
            fps,
          });

        },

      setMemoryUsage:
        (
          memoryUsage
        ) => {

          set({
            memoryUsage,
          });

        },

      setWebsocketLatency:
        (
          websocketLatency
        ) => {

          set({
            websocketLatency,
          });

        },

      setRuntimeHealth:
        (
          runtimeHealth
        ) => {

          set({
            runtimeHealth,
          });

        },

    })
  );

export default
  useRuntimeMetricsStore;