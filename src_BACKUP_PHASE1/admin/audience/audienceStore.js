import {
  create,
} from "zustand";

const useAudienceStore =
  create(
    (
      set
    ) => ({

      audiences:
        [],

      selectedAudience:
        null,

      setAudiences:
        (
          audiences
        ) => {

          set({
            audiences,
          });

        },

      setSelectedAudience:
        (
          selectedAudience
        ) => {

          set({
            selectedAudience,
          });

        },

    })
  );

export default
  useAudienceStore;