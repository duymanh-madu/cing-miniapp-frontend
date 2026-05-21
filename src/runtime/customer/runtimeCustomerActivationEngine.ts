import {
  isEligibleForMembership,
} from "./runtimeCustomerEligibilityEngine";

export async function activateCustomerMembership() {

  const eligible =
    isEligibleForMembership({

      phoneGranted:
        true,

      oaFollowed:
        true,

    });

  if (
    !eligible
  ) {

    console.log(
      "[ACTIVATION] Customer not eligible"
    );

    return false;

  }

  console.log(
    "[ACTIVATION] Membership activated"
  );

  return true;

}