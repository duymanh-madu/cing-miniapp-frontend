import {
  create,
} from "zustand";

const useUiStore =
  create(
    (
      set
    ) => ({

      globalLoading:
        false,

      sidebarOpened:
        false,

      modalOpened:
        false,

      setGlobalLoading:
        (
          value
        ) => {

          set({

            globalLoading:
              Boolean(
                value
              ),

          });

        },

      setSidebarOpened:
        (
          value
        ) => {

          set({

            sidebarOpened:
              Boolean(
                value
              ),

          });

        },

      setModalOpened:
        (
          value
        ) => {

          set({

            modalOpened:
              Boolean(
                value
              ),

          });

        },

    })
  );

export default
  useUiStore;