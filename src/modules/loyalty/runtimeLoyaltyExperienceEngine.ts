import {
  useRuntimeCrmSyncStore,
} from "../crm/runtimeCrmSyncStore";

import {
  useRuntimeLoyaltyExperienceStore,
} from "./runtimeLoyaltyExperienceStore";

import {
  calculateTierProgress,
} from "./runtimeLoyaltyProgressEngine";

import {
  resolveNextTier,
} from "./runtimeLoyaltyTierProgressionEngine";

export function initializeLoyaltyExperience() {

  console.log(
    "[LOYALTY] Initializing experience"
  );

  const customer =
    useRuntimeCrmSyncStore
      .getState()
      .customer;

  if (!customer) {

    return;
  }

  useRuntimeLoyaltyExperienceStore
    .getState()
    .setLoyaltyExperience({

      loyaltyPoints:
        customer.loyaltyPoints,

      totalSpent:
        customer.totalSpent,

      currentTier:
        customer.memberTier,

      nextTier:
        resolveNextTier(
          customer.memberTier
        ),

      progressPercent:
        calculateTierProgress(
          customer.totalSpent
        ),

    });

  console.log(
    "[LOYALTY] Experience ready"
  );

}