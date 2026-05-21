import { create }
  from "zustand";

export const useRuntimeStore =
  create((set) => ({

    runtimeErrors: [],

    duplicateListeners: 0,

    memoryWarnings: 0,

    pushRuntimeError(error) {

      set((state) => ({

        runtimeErrors: [

          error,

          ...state.runtimeErrors,

        ].slice(0, 20),

      }));

    },

    incrementDuplicateListeners() {

      set((state) => ({

        duplicateListeners:
          state.duplicateListeners + 1,

      }));

    },

    incrementMemoryWarnings() {

      set((state) => ({

        memoryWarnings:
          state.memoryWarnings + 1,

      }));

    },

  }));