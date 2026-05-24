import {
  create,
} from "zustand";

const useRegionStore =
  create(
    (
      set
    ) => ({

      regions:
        [],

      regionalRevenue:
        {},

      regionalRealtimeMetrics:
        {},

      setRegions:
        (
          regions
        ) => {

          set({
            regions,
          });

        },

      setRegionalRevenue:
        (
          regionalRevenue
        ) => {

          set({
            regionalRevenue,
          });

        },

      setRegionalRealtimeMetrics:
        (
          regionalRealtimeMetrics
        ) => {

          set({
            regionalRealtimeMetrics,
          });

        },

    })
  );

export default
  useRegionStore;