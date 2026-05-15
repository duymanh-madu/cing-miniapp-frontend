import {
  create,
} from "zustand";

const useObservabilityStore =
  create(
    (
      set
    ) => ({

      realtimeLogs:
        [],

      systemHealth:
        {},

      infrastructureMetrics:
        {},

      websocketMetrics:
        {},

      queueMetrics:
        {},

      activeIncidents:
        [],

      initialized:
        false,

      loading:
        false,

      appendRealtimeLog:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeLogs: [

                payload,

                ...state.realtimeLogs,

              ].slice(
                0,
                300
              ),

            })
          );

        },

      setSystemHealth:
        (
          systemHealth
        ) => {

          set({
            systemHealth,
          });

        },

      setInfrastructureMetrics:
        (
          infrastructureMetrics
        ) => {

          set({
            infrastructureMetrics,
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

      setQueueMetrics:
        (
          queueMetrics
        ) => {

          set({
            queueMetrics,
          });

        },

      setActiveIncidents:
        (
          activeIncidents
        ) => {

          set({
            activeIncidents,
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
  useObservabilityStore;