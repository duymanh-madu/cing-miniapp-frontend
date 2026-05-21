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
  hydrateCustomerProfile,
} from "./runtimeCustomerProfileHydrator";

export async function initializeCustomerIdentityEngine() {

  console.log(
    "[IDENTITY] Runtime identity initializing"
  );

  const phoneGranted =
    await requestPhonePermission();

  const oaFollowed =
    await verifyOAFollowStatus();

  console.log(
    "[IDENTITY] Permission status",
    {
      phoneGranted,
      oaFollowed,
    }
  );

  const activated =
    await activateCustomerMembership();

  if (
    activated
  ) {

    await hydrateCustomerProfile();

  }

  console.log(
    "[IDENTITY] Runtime identity ready"
  );

}