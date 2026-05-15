import {
  create,
} from "zustand";

const useLoyaltyStore =
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
  useLoyaltyStore;