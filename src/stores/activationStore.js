import { create }
from "zustand";

const useActivationStore =
  create((set) => ({

    activated: false,

    hydrated: false,

    sessionReady: false,

    setActivated:
      (value) =>
        set({
          activated: value,
        }),

    setHydrated:
      (value) =>
        set({
          hydrated: value,
        }),

    setSessionReady:
      (value) =>
        set({
          sessionReady: value,
        }),

  }));

export default
  useActivationStore;