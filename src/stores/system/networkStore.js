import {
  create,
} from "zustand";

const useNetworkStore =
  create(
    (
      set
    ) => ({

      online:
        navigator.onLine,

      setOnline:
        (
          value
        ) => {

          set({

            online:
              Boolean(
                value
              ),

          });

        },

    })
  );

export default
  useNetworkStore;