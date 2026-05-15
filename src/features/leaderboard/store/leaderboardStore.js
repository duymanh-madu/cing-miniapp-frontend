import {
  create,
} from "zustand";

const useLeaderboardStore =
  create(
    (set) => ({

      entries: [],

      setEntries:
        (entries) => {

          set({
            entries,
          });

        },

    })
  );

export default
  useLeaderboardStore;