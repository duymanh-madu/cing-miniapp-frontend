import {
  requestPhonePermission,
} from "./runtimeCustomerPermissionEngine";

import {
  verifyOAFollowStatus,
} from "./runtimeCustomerFollowEngine";

import {
  activateCustomerMembership,
} from "./runtimeCustomerActivationEngine";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  hydrateCustomerProfile,
} from "./runtimeCustomerProfileHydrator";

import {
  useRuntimeCustomerIdentityStore,
} from "./runtimeCustomerIdentityStore";

export async function initializeCustomerIdentityEngine() {

  const store =
    useRuntimeCustomerIdentityStore
      .getState();

  if (
    store.activationStatus === "checking" ||
    store.activationStatus === "activated"
  ) {

    return;

  }

  store.setActivationStatus(
    "checking"
  );

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Runtime identity initializing"
  );

  const [
    phoneGranted,
    oaFollowed,
  ] = await Promise.all([

    requestPhonePermission().catch(() => null),

    verifyOAFollowStatus(),

  ]);

  store.setPermissionState({
    phoneGranted,
    oaFollowed,
  });

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Permission status",
    {
      phoneGranted,
      oaFollowed,
    }
  );

  const activated =
    await activateCustomerMembership({
      phoneGranted,
      oaFollowed,
    });

  store.setIdentity({
    phoneGranted,
    oaFollowed,
    memberActivated:
      activated,
  });

  if (!activated) {

    store.setActivationStatus(
      "blocked"
    );

    return;

  }

  const profile =
    await hydrateCustomerProfile();

  store.setIdentity({
    customerId:
      profile.customerId || "",
    fullName:
      profile.fullName || "",
    memberActivated:
      true,
  });

  store.setProfileHydrated(
    true
  );

  store.setActivationStatus(
    "activated"
  );

  runtimeLogger.info(
    "RUNTIME",
    "[IDENTITY] Runtime identity ready"
  );

}
