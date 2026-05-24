import { create }
  from "zustand";

export const useMembershipStore =
  create((set) => ({

    membershipTier:
      "Bronze",

    loyaltyPoints:
      0,

    walletItems: [],

    loyaltyHistory: [],

    setMembershipTier(tier) {

      set({

        membershipTier:
          tier,

      });

    },

    setLoyaltyPoints(points) {

      set({

        loyaltyPoints:
          points,

      });

    },

    setWalletItems(items) {

      set({

        walletItems:
          items,

      });

    },

    setLoyaltyHistory(history) {

      set({

        loyaltyHistory:
          history,

      });

    },

  }));