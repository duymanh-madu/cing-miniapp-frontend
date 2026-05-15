import {
  create,
} from "zustand";

const useDistributionStore =
  create(
    (
      set
    ) => ({

      campaignDistributions:
        [],

      branchDeployments:
        [],

      rolloutStatus:
        {},

      setCampaignDistributions:
        (
          campaignDistributions
        ) => {

          set({
            campaignDistributions,
          });

        },

      setBranchDeployments:
        (
          branchDeployments
        ) => {

          set({
            branchDeployments,
          });

        },

      setRolloutStatus:
        (
          rolloutStatus
        ) => {

          set({
            rolloutStatus,
          });

        },

    })
  );

export default
  useDistributionStore;