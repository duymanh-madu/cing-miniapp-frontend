import { runtimeGovernance } from "./runtimeGovernance";

export function bootstrapGovernance() {

  // ===== FEATURE FLAGS =====
  runtimeGovernance.registerFeature({
    key: "LOYALTY_SYSTEM",
    status: "ENABLED",
  });

  runtimeGovernance.registerFeature({
    key: "CAMPAIGN_SYSTEM",
    status: "ENABLED",
  });

  runtimeGovernance.registerFeature({
    key: "AUTOMATION_ENGINE",
    status: "ENABLED",
  });

  // ===== RBAC MODULE CONTROL =====
  runtimeGovernance.registerPermission({
    module: "admin.orders",
    allowedRoles: ["ADMIN", "STAFF"],
    enabled: true,
  });

  runtimeGovernance.registerPermission({
    module: "admin.analytics",
    allowedRoles: ["ADMIN"],
    enabled: true,
  });

  runtimeGovernance.registerPermission({
    module: "admin.automation",
    allowedRoles: ["ADMIN"],
    enabled: true,
  });

  runtimeGovernance.registerPermission({
    module: "admin.behavior",
    allowedRoles: ["ADMIN"],
    enabled: true,
  });

  runtimeGovernance.registerPermission({
    module: "admin.observability",
    allowedRoles: ["ADMIN"],
    enabled: true,
  });

}
