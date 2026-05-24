import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  isEligibleForMembership,
} from "./runtimeCustomerEligibilityEngine";

type ActivateCustomerMembershipInput = {
  phoneGranted: boolean;
  oaFollowed: boolean;
};

export async function activateCustomerMembership(
  input: ActivateCustomerMembershipInput
) {

  const eligible =
    isEligibleForMembership(
      input
    );

  if (!eligible) {

    runtimeLogger.info(
      "RUNTIME",
      "[ACTIVATION] Customer not eligible"
    );

    return false;

  }

  runtimeLogger.info(
    "RUNTIME",
    "[ACTIVATION] Membership activated"
  );

  return true;

}
