import {
  useRuntimeCrmSyncStore,
} from "../crm/runtimeCrmSyncStore";

import {
  useRuntimeAdminAuditStore,
} from "./runtimeAdminAuditStore";

export function overrideMemberTier(
  memberTier: string
) {

  const customer =
    useRuntimeCrmSyncStore
      .getState()
      .customer;

  if (!customer) {

    return;
  }

  useRuntimeCrmSyncStore
    .getState()
    .setCustomer({

      ...customer,

      memberTier,

    });

  useRuntimeAdminAuditStore
    .getState()
    .pushAuditLog({

      id:
        crypto.randomUUID(),

      action:
        `Override member tier → ${memberTier}`,

      operator:
        "admin",

      createdAt:
        new Date()
          .toISOString(),

    });

  console.log(
    "[ADMIN] Member tier overridden",
    memberTier
  );

}