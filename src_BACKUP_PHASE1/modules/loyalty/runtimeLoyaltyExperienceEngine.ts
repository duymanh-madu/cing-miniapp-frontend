import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  useRuntimeCrmSyncStore,
} from "@/runtime/crm/runtimeCrmSyncStore";

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

  runtimeLogger.info("APP", 
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

  runtimeLogger.info("APP", 
    "[LOYALTY] Experience ready"
  );

}