import {
  create,
} from "zustand";

const useRuntimeObservabilityDashboardStore =
  create(
    (
      set
    ) => ({

      realtimeRuntimeMetrics:
        {},

      runtimeDiagnostics:
        [],

      distributedTraces:
        [],

      websocketMetrics:
        {},

      setRealtimeRuntimeMetrics:
        (
          realtimeRuntimeMetrics
        ) => {

          set({
            realtimeRuntimeMetrics,
          });

        },

      setRuntimeDiagnostics:
        (
          runtimeDiagnostics
        ) => {

          set({
            runtimeDiagnostics,
          });

        },

      setDistributedTraces:
        (
          distributedTraces
        ) => {

          set({
            distributedTraces,
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

    })
  );

export default
  useRuntimeObservabilityDashboardStore;