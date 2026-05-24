import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  initializeMembershipCardEngine,
} from "./runtimeMembershipCardEngine";

import {

  initializeMembershipCardSubscriptions,
} from "./runtimeMembershipCardSubscriptions";

export async function initializeMembershipCardRuntime() {

  runtimeLogger.info("APP", 
    "[CARD] Runtime initializing"
  );

  await initializeMembershipCardEngine();

  await initializeMembershipCardSubscriptions();

  runtimeLogger.info("APP", 
    "[CARD] Runtime ready"
  );

}