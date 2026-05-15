import {
  create,
} from "zustand";

const useAppStore =
  create(
    (
      set
    ) => ({

      initialized:
        false,

      bootstrapped:
        false,

      hydrated:
        false,

      setInitialized:
        (
          value
        ) => {

          set({

            initialized:
              Boolean(
                value
              ),

          });

        },

      setBootstrapped:
        (
          value
        ) => {

          set({

            bootstrapped:
              Boolean(
                value
              ),

          });

        },

      setHydrated:
        (
          value
        ) => {

          set({

            hydrated:
              Boolean(
                value
              ),

          });

        },

      reset:
        () => {

          set({

            initialized:
              false,

            bootstrapped:
              false,

            hydrated:
              false,

          });

        },

    })
  );

export default
  useAppStore;