import {
  create,
} from "zustand";

const useCampaignStore =
  create(
    (set) => ({

      campaigns: [],

      setCampaigns:
        (campaigns) => {

          set({
            campaigns,
          });

        },

    })
  );

export default
  useCampaignStore;