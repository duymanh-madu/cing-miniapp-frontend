import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { isEligibleForMembership } from "./runtimeCustomerEligibilityEngine";

type ActivateCustomerMembershipInput = {
  phoneGranted: boolean | string | null;
  oaFollowed: boolean;
};

export async function activateCustomerMembership(input: ActivateCustomerMembershipInput) {
  const hasPhone =
    input.phoneGranted === true ||
    (typeof input.phoneGranted === "string" &&
      input.phoneGranted.replace(/\D/g, "").length >= 9);

  const eligible = isEligibleForMembership({
    phoneGranted: hasPhone,
    oaFollowed: input.oaFollowed,
  });

  if (!eligible) {
    runtimeLogger.info("RUNTIME", "[ACTIVATION] Customer not eligible");
    return false;
  }

  runtimeLogger.info("RUNTIME", "[ACTIVATION] Membership activated");
  return true;
}
