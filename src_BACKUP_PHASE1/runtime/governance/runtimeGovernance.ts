import { featureFlagEngine } from "./featureFlagEngine";

import {
  RuntimeRole,
  RuntimeModulePermission,
  RuntimeFeatureFlag,
} from "./governanceTypes";

import { rbacEngine } from "./rbacEngine";

class RuntimeGovernance {

  // =========================
  // FEATURE FLAGS
  // =========================

  registerFeature(flag: RuntimeFeatureFlag) {
    featureFlagEngine.register(flag);
  }

  isFeatureEnabled(key: string) {
    return featureFlagEngine.isEnabled(key);
  }

  setFeatureStatus(key: string, status: "ENABLED" | "DISABLED") {
    featureFlagEngine.setStatus(key, status);
  }

  // =========================
  // RBAC CONTROL
  // =========================

  registerPermission(permission: RuntimeModulePermission) {
    rbacEngine.register(permission);
  }

  canAccess(module: string, role: RuntimeRole) {
    return rbacEngine.canAccess(module, role);
  }

  disableModule(module: string) {
    rbacEngine.disable(module);
  }

  // =========================
  // DEBUG / INSPECTION
  // =========================

  getFeatureFlags() {
    return featureFlagEngine.getAll();
  }

}

export const runtimeGovernance = new RuntimeGovernance();
