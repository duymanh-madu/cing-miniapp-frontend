import { create } from "zustand";

interface RuntimeLoyaltyExperienceState {

  loyaltyPoints:
    number;

  totalSpent:
    number;

  currentTier:
    string;

  nextTier:
    string | null;

  progressPercent:
    number;

  setLoyaltyExperience: (
    payload: {

      loyaltyPoints:
        number;

      totalSpent:
        number;

      currentTier:
        string;

      nextTier:
        string | null;

      progressPercent:
        number;

    }
  ) => void;

}

export const useRuntimeLoyaltyExperienceStore =
  create<RuntimeLoyaltyExperienceState>(

    (
      set
    ) => ({

      loyaltyPoints:
        0,

      totalSpent:
        0,

      currentTier:
        "Hội viên",

      nextTier:
        null,

      progressPercent:
        0,

      setLoyaltyExperience: (
        payload
      ) => set({

        loyaltyPoints:
          payload.loyaltyPoints,

        totalSpent:
          payload.totalSpent,

        currentTier:
          payload.currentTier,

        nextTier:
          payload.nextTier,

        progressPercent:
          payload.progressPercent,

      }),

    })

  );