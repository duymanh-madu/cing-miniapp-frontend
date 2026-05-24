import {
  useRuntimeCrmSyncStore,
} from "../crm/runtimeCrmSyncStore";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

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

  runtimeLogger.info("RUNTIME", 
    "[ADMIN] Member tier overridden",
    memberTier
  );

}