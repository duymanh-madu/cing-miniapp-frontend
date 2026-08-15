import { create }
  from "zustand";

export const useMembershipStore =
  create((set) => ({

    membershipTier:
      "Bronze",

    loyaltyPoints:
      0,

    loyaltyPointsPhone:
      "",

    walletItems: [],

    loyaltyHistory: [],

    setMembershipTier(tier) {

      set({

        membershipTier:
          tier,

      });

    },

    setLoyaltyPoints(
      points,
      phone = ""
    ) {

      set({

        loyaltyPoints:
          Number(
            points || 0
          ),

        loyaltyPointsPhone:
          String(
            phone || ""
          ),

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