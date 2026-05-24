import { create }
  from "zustand";

export const useStabilityStore =
  create((set) => ({

    crashCount: 0,

    lastError: null,

    incrementCrash() {

      set((state) => ({

        crashCount:
          state.crashCount + 1,

      }));

    },

    setLastError(error) {

      set({

        lastError:
          error,

      });

    },

  }));