import {
  create,
} from "zustand";

const useEngagementStore =
  create(
    (
      set
    ) => ({

      engagementScores:
        [],

      customerJourneys:
        [],

      setEngagementScores:
        (
          engagementScores
        ) => {

          set({
            engagementScores,
          });

        },

      setCustomerJourneys:
        (
          customerJourneys
        ) => {

          set({
            customerJourneys,
          });

        },

    })
  );

export default
  useEngagementStore;