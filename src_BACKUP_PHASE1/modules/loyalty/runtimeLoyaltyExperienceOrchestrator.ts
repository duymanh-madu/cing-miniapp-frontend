import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

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

  runtimeLogger.info("APP", 
    "[LOYALTY] Runtime initializing"
  );

  initializeLoyaltyExperience();

  initializeLoyaltyRealtimeSubscriptions();

  initializeRewardRuntime();

  runtimeLogger.info("APP", 
    "[LOYALTY] Runtime ready"
  );

}