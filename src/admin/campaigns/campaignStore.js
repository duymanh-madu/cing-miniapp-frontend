import {
  create,
} from "zustand";

const useCampaignStore =
  create(
    (
      set
    ) => ({

      campaigns:
        [],

      selectedCampaign:
        null,

      loading:
        false,

      initialized:
        false,

      setCampaigns:
        (
          campaigns
        ) => {

          set({

            campaigns,

            initialized:
              true,

          });

        },

      setSelectedCampaign:
        (
          campaign
        ) => {

          set({
            selectedCampaign:
              campaign,
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
  useCampaignStore;