import {
  create,
} from "zustand";

const useAnalyticsStore =
  create(
    (
      set
    ) => ({

      metrics:
        {},

      realtimeFeed:
        [],

      initialized:
        false,

      loading:
        false,

      setMetrics:
        (
          metrics
        ) => {

          set({

            metrics,

            initialized:
              true,

          });

        },

      appendFeed:
        (
          event
        ) => {

          set(
            (
              state
            ) => ({

              realtimeFeed: [

                event,

                ...state.realtimeFeed,

              ].slice(
                0,
                100
              ),

            })
          );

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
  useAnalyticsStore;