import { create } from "zustand";

interface LoyaltyRuntimeState {

  currentTier: string;

  points: number;

  nextTier: string;

  setLoyaltyState: (
    payload: {

      currentTier: string;

      points: number;

      nextTier: string;

    }
  ) => void;

}

export const useLoyaltyRuntimeStore =
  create<LoyaltyRuntimeState>(

    (
      set
    ) => ({

      currentTier:
        "Hội viên",

      points: 0,

      nextTier:
        "Hội viên thân thiết",

      setLoyaltyState: (
        payload
      ) => set({

        currentTier:
          payload.currentTier,

        points:
          payload.points,

        nextTier:
          payload.nextTier,

      }),

    })

  );