import {
  create,
} from "zustand";

const useCampaignSchedulerStore =
  create(
    (
      set
    ) => ({

      schedules:
        [],

      setSchedules:
        (
          schedules
        ) => {

          set({
            schedules,
          });

        },

    })
  );

export default
  useCampaignSchedulerStore;