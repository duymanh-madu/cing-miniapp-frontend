import {
  create,
} from "zustand";

const useFeatureFlagStore =
  create(
    (
      set
    ) => ({

      flags:
        {},

      initialized:
        false,

      setFlags:
        (
          flags
        ) => {

          set({

            flags,

            initialized:
              true,

          });

        },

    })
  );

export default
  useFeatureFlagStore;