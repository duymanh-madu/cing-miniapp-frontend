import {
  create,
} from "zustand";

const useCampaignOrchestrationStore =
  create(
    (
      set
    ) => ({

      workflows:
        [],

      setWorkflows:
        (
          workflows
        ) => {

          set({
            workflows,
          });

        },

    })
  );

export default
  useCampaignOrchestrationStore;