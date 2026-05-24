import {
  create,
} from "zustand";

const useConfigStore =
  create(
    (
      set
    ) => ({

      loaded:
        false,

      config:
        {},

      setConfig:
        (
          config
        ) => {

          set({

            loaded:
              true,

            config:
              config || {},

          });

        },

      reset:
        () => {

          set({

            loaded:
              false,

            config:
              {},

          });

        },

    })
  );

export default
  useConfigStore;