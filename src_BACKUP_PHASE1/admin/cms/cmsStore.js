import {
  create,
} from "zustand";

const useCmsStore =
  create(
    (
      set
    ) => ({

      pages:
        [],

      initialized:
        false,

      loading:
        false,

      setPages:
        (
          pages
        ) => {

          set({

            pages,

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
  useCmsStore;