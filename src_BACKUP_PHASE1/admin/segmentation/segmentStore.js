import {
  create,
} from "zustand";

const useSegmentStore =
  create(
    (
      set
    ) => ({

      segments:
        [],

      setSegments:
        (
          segments
        ) => {

          set({
            segments,
          });

        },

    })
  );

export default
  useSegmentStore;