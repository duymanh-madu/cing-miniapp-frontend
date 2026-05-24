import {
  create,
} from "zustand";

const useLoyaltyStore =
  create(
    (
      set
    ) => ({

      rewards:
        [],

      pointRules:
        [],

      loyaltyMetrics:
        {},

      initialized:
        false,

      loading:
        false,

      setRewards:
        (
          rewards
        ) => {

          set({
            rewards,
          });

        },

      setPointRules:
        (
          pointRules
        ) => {

          set({
            pointRules,
          });

        },

      setLoyaltyMetrics:
        (
          loyaltyMetrics
        ) => {

          set({
            loyaltyMetrics,
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
  useLoyaltyStore;