import {
  create,
} from "zustand";

const useCommunicationAnalyticsStore =
  create(
    (
      set
    ) => ({

      communicationMetrics:
        {},

      engagementTimeline:
        [],

      setCommunicationMetrics:
        (
          communicationMetrics
        ) => {

          set({
            communicationMetrics,
          });

        },

      setEngagementTimeline:
        (
          engagementTimeline
        ) => {

          set({
            engagementTimeline,
          });

        },

    })
  );

export default
  useCommunicationAnalyticsStore;