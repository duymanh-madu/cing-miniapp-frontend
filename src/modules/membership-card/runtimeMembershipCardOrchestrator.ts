import {
  initializeMembershipCardEngine,
} from "./runtimeMembershipCardEngine";

import {
  initializeMembershipCardSubscriptions,
} from "./runtimeMembershipCardSubscriptions";

export async function initializeMembershipCardRuntime() {

  console.log(
    "[CARD] Runtime initializing"
  );

  await initializeMembershipCardEngine();

  await initializeMembershipCardSubscriptions();

  console.log(
    "[CARD] Runtime ready"
  );

}