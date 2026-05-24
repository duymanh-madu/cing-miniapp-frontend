import {
  create,
} from "zustand";

const useLoyaltyFeatureStore =
  create(
    (set) => ({

      points: 0,

      setPoints:
        (points) => {

          set({
            points,
          });

        },

    })
  );

export default
  useLoyaltyFeatureStore;