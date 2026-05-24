import {
  create,
} from "zustand";

const useRuntimeConfigStore =
  create(
    (
      set
    ) => ({

      config:
        {},

      initialized:
        false,

      loading:
        false,

      setConfig:
        (
          config
        ) => {

          set({

            config,

            initialized:
              true,

          });

        },

      setLoading:
        (
          loading
        ) => {

          set({
            loading,
          });

        },

    })
  );

export default
  useRuntimeConfigStore;