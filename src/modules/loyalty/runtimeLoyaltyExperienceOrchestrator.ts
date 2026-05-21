import {
  initializeLoyaltyExperience,
} from "./runtimeLoyaltyExperienceEngine";

import {
  initializeLoyaltyRealtimeSubscriptions,
} from "./runtimeLoyaltyRealtimeSubscriptions";

import {
  initializeRewardRuntime,
} from "./runtimeLoyaltyRewardRuntime";

export function initializeRealtimeLoyaltyRuntime() {

  console.log(
    "[LOYALTY] Runtime initializing"
  );

  initializeLoyaltyExperience();

  initializeLoyaltyRealtimeSubscriptions();

  initializeRewardRuntime();

  console.log(
    "[LOYALTY] Runtime ready"
  );

}