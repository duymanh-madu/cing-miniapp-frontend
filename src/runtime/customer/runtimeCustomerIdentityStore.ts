import {
  create,
} from "zustand";

import type {
  RuntimeCustomerIdentity,
  RuntimeMembershipTier,
} from "./runtimeCustomerIdentityTypes";

type ActivationStatus =
  | "idle"
  | "checking"
  | "eligible"
  | "activated"
  | "blocked"
  | "failed";

type RuntimeCustomerIdentityState = {
  identity: RuntimeCustomerIdentity | null;
  activationStatus: ActivationStatus;
  phoneGranted: boolean;
  oaFollowed: boolean;
  memberActivated: boolean;
  profileHydrated: boolean;
  lastUpdatedAt: string | null;

  setPermissionState: (payload: {
    phoneGranted?: boolean;
    oaFollowed?: boolean;
  }) => void;

  setActivationStatus: (
    status: ActivationStatus
  ) => void;

  setIdentity: (
    identity: Partial<RuntimeCustomerIdentity>
  ) => void;

  setProfileHydrated: (
    value: boolean
  ) => void;

  resetIdentity: () => void;
};

const defaultIdentity: RuntimeCustomerIdentity = {
  customerId: "",
  zaloUserId: "",
  phone: "",
  fullName: "",
  avatar: "",
  oaFollowed: false,
  phoneGranted: false,
  memberActivated: false,
  tier: "hoi_vien" as RuntimeMembershipTier,
  loyaltyPoints: 0,
  cumulativeSpending: 0,
};

export const useRuntimeCustomerIdentityStore =
  create<RuntimeCustomerIdentityState>((set, get) => ({

    identity:
      null,

    activationStatus:
      "idle",

    phoneGranted:
      false,

    oaFollowed:
      false,

    memberActivated:
      false,

    profileHydrated:
      false,

    lastUpdatedAt:
      null,

    setPermissionState(payload) {

      const current =
        get().identity || defaultIdentity;

      const nextPhoneGranted =
        payload.phoneGranted ??
        get().phoneGranted;

      const nextOaFollowed =
        payload.oaFollowed ??
        get().oaFollowed;

      set({
        phoneGranted:
          nextPhoneGranted,

        oaFollowed:
          nextOaFollowed,

        identity: {
          ...current,
          phoneGranted:
            nextPhoneGranted,
          oaFollowed:
            nextOaFollowed,
        },

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    setActivationStatus(status) {

      set({
        activationStatus:
          status,

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    setIdentity(identity) {

      const current =
        get().identity || defaultIdentity;

      const merged = {
        ...current,
        ...identity,
      };

      set({
        identity:
          merged,

        phoneGranted:
          merged.phoneGranted,

        oaFollowed:
          merged.oaFollowed,

        memberActivated:
          merged.memberActivated,

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    setProfileHydrated(value) {

      set({
        profileHydrated:
          value,

        lastUpdatedAt:
          new Date().toISOString(),
      });

    },

    resetIdentity() {

      set({
        identity:
          null,

        activationStatus:
          "idle",

        phoneGranted:
          false,

        oaFollowed:
          false,

        memberActivated:
          false,

        profileHydrated:
          false,

        lastUpdatedAt:
          null,
      });

    },

  }));
