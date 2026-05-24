import {
  create,
} from "zustand";

const useRealtimeClusterStore =
  create(
    (
      set
    ) => ({

      websocketClusters:
        [],

      activeConnections:
        {},

      realtimeScalingMetrics:
        {},

      clusterHealth:
        {},

      setWebsocketClusters:
        (
          websocketClusters
        ) => {

          set({
            websocketClusters,
          });

        },

      setActiveConnections:
        (
          activeConnections
        ) => {

          set({
            activeConnections,
          });

        },

      setRealtimeScalingMetrics:
        (
          realtimeScalingMetrics
        ) => {

          set({
            realtimeScalingMetrics,
          });

        },

      setClusterHealth:
        (
          clusterHealth
        ) => {

          set({
            clusterHealth,
          });

        },

    })
  );

export default
  useRealtimeClusterStore;