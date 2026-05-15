import {
  create,
} from "zustand";

const useDesignerStore =
  create(
    (
      set
    ) => ({

      designSystem:
        null,

      activeComponents:
        [],

      componentTree:
        [],

      setDesignSystem:
        (
          designSystem
        ) => {

          set({
            designSystem,
          });

        },

      setActiveComponents:
        (
          activeComponents
        ) => {

          set({
            activeComponents,
          });

        },

      setComponentTree:
        (
          componentTree
        ) => {

          set({
            componentTree,
          });

        },

    })
  );

export default
  useDesignerStore;