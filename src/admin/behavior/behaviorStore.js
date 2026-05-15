import {
  create,
} from "zustand";

const useBehaviorStore =
  create(
    (
      set
    ) => ({

      realtimeActivities:
        [],

      engagementMetrics:
        {},

      setRealtimeActivities:
        (
          realtimeActivities
        ) => {

          set({
            realtimeActivities,
          });

        },

      appendActivity:
        (
          payload
        ) => {

          set(
            (
              state
            ) => ({

              realtimeActivities: [

                payload,

                ...state.realtimeActivities,

              ].slice(
                0,
                100
              ),

            })
          );

        },

      setEngagementMetrics:
        (
          engagementMetrics
        ) => {

          set({
            engagementMetrics,
          });

        },

    })
  );

export default
  useBehaviorStore;