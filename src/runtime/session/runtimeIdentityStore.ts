import { create } from "zustand";

import {
  MEMBER_TIERS,
} from "./runtimeIdentityConstants";

interface RuntimeIdentityState {

  customerId:
    string | null;

  displayName:
    string;

  avatar:
    string;

  memberTier:
    string;

  partnerTier:
    string | null;

  isAdmin:
    boolean;

  setIdentity: (
    payload: {

      customerId:
        string | null;

      displayName:
        string;

      avatar:
        string;

      memberTier:
        string;

      partnerTier:
        string | null;

      isAdmin:
        boolean;

    }
  ) => void;

}

export const useRuntimeIdentityStore =
  create<RuntimeIdentityState>(

    (
      set
    ) => ({

      customerId:
        null,

      displayName:
        "",

      avatar:
        "",

      memberTier:
        MEMBER_TIERS.MEMBER,

      partnerTier:
        null,

      isAdmin:
        false,

      setIdentity: (
        payload
      ) => set({

        customerId:
          payload.customerId,

        displayName:
          payload.displayName,

        avatar:
          payload.avatar,

        memberTier:
          payload.memberTier,

        partnerTier:
          payload.partnerTier,

        isAdmin:
          payload.isAdmin,

      }),

    })

  );