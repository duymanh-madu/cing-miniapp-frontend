import {
  create,
} from "zustand";

const useFranchiseStore =
  create(
    (
      set
    ) => ({

      franchises:
        [],

      activeBranches:
        [],

      branchRealtimeMetrics:
        {},

      franchiseAnalytics:
        {},

      initialized:
        false,

      loading:
        false,

      setFranchises:
        (
          franchises
        ) => {

          set({
            franchises,
          });

        },

      setActiveBranches:
        (
          activeBranches
        ) => {

          set({
            activeBranches,
          });

        },

      setBranchRealtimeMetrics:
        (
          branchRealtimeMetrics
        ) => {

          set({
            branchRealtimeMetrics,
          });

        },

      setFranchiseAnalytics:
        (
          franchiseAnalytics
        ) => {

          set({
            franchiseAnalytics,
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
  useFranchiseStore;