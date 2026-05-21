import {
  useRuntimeIdentityStore,
} from "./runtimeIdentityStore";

import {
  MEMBER_TIERS,
} from "./runtimeIdentityConstants";

export function hydrateRuntimeIdentity() {

  useRuntimeIdentityStore
    .getState()
    .setIdentity({

      customerId:
        "runtime-demo-user",

      displayName:
        "Cing User",

      avatar:
        "",

      memberTier:
        MEMBER_TIERS.GOLD,

      partnerTier:
        null,

      isAdmin:
        false,

    });

  console.log(
    "[IDENTITY] Runtime hydrated"
  );

}