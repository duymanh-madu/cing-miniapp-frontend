import {
  create,
} from "zustand";

type RuntimeMembershipCardState = {
  card: any | null;
  ready: boolean;
  pendingActivation: boolean;
  lastHydratedAt: string | null;
  setCard: (card: any) => void;
  resetCard: () => void;
};

export const useRuntimeMembershipCardStore =
  create<RuntimeMembershipCardState>((set) => ({

    card:
      null,

    ready:
      false,

    pendingActivation:
      true,

    lastHydratedAt:
      null,

    setCard(card) {

      set({

        card,

        ready:
          true,

        pendingActivation:
          Boolean(card?.pendingActivation),

        lastHydratedAt:
          new Date().toISOString(),

      });

    },

    resetCard() {

      set({

        card:
          null,

        ready:
          false,

        pendingActivation:
          true,

        lastHydratedAt:
          null,

      });

    },

  }));
